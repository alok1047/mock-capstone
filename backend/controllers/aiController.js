/**
 * AI Lost-Product Search Assistant
 *
 * Pipeline:
 *   1. Parse the user's natural-language query into {item, color, category, location}.
 *      - If GEMINI_API_KEY is set, use Gemini for richer extraction.
 *      - Otherwise (or if AI fails), fall back to a deterministic rule-based parser.
 *   2. Query MongoDB for matching items (regex over name / description / location,
 *      ranked by recency).
 *   3. Compose a friendly chatbot reply (AI summary if available, else templated).
 */

const Item = require('../models/Item');

// ---------- Lightweight in-memory rate limit (per IP, per minute) ----------
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000;
const ipHits = new Map();

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = ipHits.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count += 1;
  ipHits.set(ip, entry);
  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down for a minute.',
    });
  }
  next();
};

// ---------- Heuristic parser (used as fallback / always as a safety net) ----------
const KNOWN_COLORS = [
  'black', 'white', 'red', 'blue', 'green', 'yellow', 'orange',
  'purple', 'pink', 'brown', 'grey', 'gray', 'silver', 'golden', 'gold',
];
const CATEGORY_HINTS = {
  Electronics: ['airpod', 'airpods', 'earphone', 'earbud', 'headphone', 'phone', 'mobile', 'laptop', 'charger', 'tablet', 'ipad', 'iphone', 'watch', 'smartwatch'],
  Bags: ['bag', 'backpack', 'purse', 'sling', 'handbag', 'suitcase'],
  Accessories: ['wallet', 'belt', 'cap', 'hat', 'umbrella', 'glasses', 'specs', 'sunglasses'],
  Jewelry: ['ring', 'chain', 'necklace', 'bracelet', 'earring', 'pendant'],
  Documents: ['id', 'license', 'passport', 'card', 'aadhaar', 'aadhar', 'pan', 'document', 'paper'],
  Clothing: ['jacket', 'shirt', 'tshirt', 'pants', 'jeans', 'shoes', 'sneaker'],
};
// Trigger words that introduce a place phrase
const LOCATION_PREPS = ['near', 'at', 'in', 'around', 'by'];

const heuristicParse = (text = '') => {
  const lower = text.toLowerCase();

  const color = KNOWN_COLORS.find((c) => new RegExp(`\\b${c}\\b`).test(lower));

  let category = null;
  let item = null;
  for (const [cat, words] of Object.entries(CATEGORY_HINTS)) {
    const hit = words.find((w) => lower.includes(w));
    if (hit) {
      category = cat;
      item = hit;
      break;
    }
  }
  // If no category-specific item, pull a noun-ish word after the color
  if (!item && color) {
    const m = lower.match(new RegExp(`${color}\\s+(\\w+)`));
    if (m) item = m[1];
  }

  // Location: take everything after the first preposition like "near X"
  let location = null;
  for (const prep of LOCATION_PREPS) {
    const re = new RegExp(`\\b${prep}\\s+(.+)$`, 'i');
    const m = text.match(re);
    if (m) {
      location = m[1].replace(/[.?!]+$/, '').trim();
      break;
    }
  }

  return {
    item: item || null,
    color: color || null,
    category: category || null,
    location: location || null,
  };
};

// ---------- Gemini parser (optional) ----------
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      }),
      signal: ctrl.signal,
    });
    if (!resp.ok) {
      console.warn('[ai] Gemini HTTP', resp.status);
      return null;
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.warn('[ai] Gemini call failed:', err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const aiParse = async (text) => {
  const prompt = `You extract structured fields from a lost/found item query.
Return ONLY a compact JSON object with keys: item, color, category, location.
Use null when unknown. Categories must be one of:
Electronics, Bags, Accessories, Jewelry, Documents, Clothing, other.

Query: "${text}"

JSON:`;
  const raw = await callGemini(prompt);
  if (!raw) return null;
  try {
    // Strip code-fence wrappers if Gemini added them
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      item: parsed.item || null,
      color: parsed.color || null,
      category: parsed.category || null,
      location: parsed.location || null,
    };
  } catch (e) {
    console.warn('[ai] Could not parse Gemini JSON:', raw?.slice(0, 120));
    return null;
  }
};

// ---------- DB search ----------
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const searchDb = async ({ item, color, category, location }) => {
  // Build OR clauses for the relevant fields
  const ors = [];
  if (item) {
    const re = new RegExp(escapeRegex(item), 'i');
    ors.push({ name: re }, { description: re });
  }
  if (color) {
    const re = new RegExp(escapeRegex(color), 'i');
    ors.push({ description: re }, { name: re });
  }
  if (location) {
    ors.push({ location: new RegExp(escapeRegex(location), 'i') });
  }

  const query = {};
  if (ors.length) query.$or = ors;
  if (category) query.category = category;

  let results = [];
  try {
    results = await Item.find(query)
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  } catch (err) {
    console.error('[ai] DB search failed:', err.message);
    return [];
  }

  // Score: +2 name match, +1 desc, +1 location, +1 color, recency tie-breaker
  const score = (it) => {
    let s = 0;
    const blob = `${it.name} ${it.description}`.toLowerCase();
    if (item && it.name?.toLowerCase().includes(item.toLowerCase())) s += 2;
    if (item && blob.includes(item.toLowerCase())) s += 1;
    if (color && blob.includes(color.toLowerCase())) s += 1;
    if (location && it.location?.toLowerCase().includes(location.toLowerCase())) s += 1;
    if (category && it.category === category) s += 1;
    return s;
  };
  results.sort((a, b) => {
    const ds = score(b) - score(a);
    if (ds !== 0) return ds;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return results.slice(0, 6);
};

// ---------- Reply composer ----------
const composeReply = async (parsed, results) => {
  const { item, color, location } = parsed;
  const subject = [color, item].filter(Boolean).join(' ') || 'item';
  const where = location ? ` near ${location}` : '';

  if (results.length === 0) {
    return `I couldn't find any matching reports for a ${subject}${where} yet. I'll keep this query and notify you if a match is reported. You can also post it as a "lost" report so others can help.`;
  }

  // Try AI-summarized reply for nicer phrasing
  const aiPrompt = `You are a friendly assistant helping reunite people with lost items.
The user described: "${subject}${where}".
We found ${results.length} matching reports. Write ONE friendly sentence (max 25 words) summarizing the result and inviting them to view details. Do not invent data.`;
  const aiText = await callGemini(aiPrompt);
  if (aiText) return aiText.trim();

  return `I found ${results.length} similar ${subject} report${
    results.length === 1 ? '' : 's'
  }${where}. Take a look at the matches below and click any to view details.`;
};

// ---------- Public handler ----------
const search = async (req, res) => {
  try {
    const message = (req.body?.message || '').toString().trim();
    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: 'Please send a "message" field.' });
    }
    if (message.length > 500) {
      return res
        .status(400)
        .json({ success: false, message: 'Query is too long.' });
    }

    // Try AI parsing first; fall back to heuristic. Merge — AI wins on each field.
    const ai = await aiParse(message);
    const heur = heuristicParse(message);
    const parsed = {
      item: ai?.item ?? heur.item,
      color: ai?.color ?? heur.color,
      category: ai?.category ?? heur.category,
      location: ai?.location ?? heur.location,
    };

    const results = await searchDb(parsed);
    const reply = await composeReply(parsed, results);

    res.json({
      success: true,
      query: message,
      parsed,
      reply,
      results: results.map((r) => ({
        _id: r._id,
        name: r.name,
        description: r.description,
        location: r.location,
        category: r.category,
        status: r.status,
        image: r.image,
        createdAt: r.createdAt,
        user: r.user ? { username: r.user.username } : null,
      })),
    });
  } catch (err) {
    console.error('[ai] search failed:', err);
    res.status(500).json({
      success: false,
      message: 'AI assistant is temporarily unavailable. Please try again.',
    });
  }
};

module.exports = { search, rateLimit };
