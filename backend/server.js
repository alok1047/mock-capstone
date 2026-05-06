// --- Node v22+ compat shim ---
// Some legacy deps (e.g. buffer-equal-constant-time used transitively by
// jsonwebtoken/jwa) read `Buffer.SlowBuffer` at module load, which was
// removed in modern Node. Alias it to Buffer so those modules keep working.
const _bufferModule = require('buffer');
if (!_bufferModule.SlowBuffer) _bufferModule.SlowBuffer = _bufferModule.Buffer;

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables BEFORE requiring anything that reads them
dotenv.config();

const connectDB = require('./config/db');
require('./config/cloudinary');
const passport = require('./config/passport');

const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// ---- Env sanity check (warn-only, never exit) ----
const REQUIRED_ENV = ['MONGO_URL', 'JWT_SECRET'];
const OPTIONAL_ENV = [
  'PORT',
  'CLIENT_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GEMINI_API_KEY',
];
const missingRequired = REQUIRED_ENV.filter((k) => !process.env[k]);
const missingOptional = OPTIONAL_ENV.filter((k) => !process.env[k]);
if (missingRequired.length) {
  console.warn(
    `[env] Missing REQUIRED vars: ${missingRequired.join(
      ', '
    )} — features will be degraded. See backend/.env.example`
  );
}
if (missingOptional.length) {
  console.warn(`[env] Missing optional vars: ${missingOptional.join(', ')}`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Core middleware ----
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CLIENT_URL may be a single URL or a comma-separated list of allowed origins.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser tools (no Origin header) and configured origins.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Allow Netlify deploy previews / branch deploys for the same site.
      if (/^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/i.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Lightweight request log
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(passport.initialize());

// ---- Routes ----
app.get('/', (_req, res) => res.send('ELIF Backend Working'));
app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewRoutes);

// ---- 404 + Error handler (keep last) ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.url}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Don't crash the process on async errors — log and keep serving
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

// ---- Start ----
connectDB(); // non-blocking; logs status

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
});
