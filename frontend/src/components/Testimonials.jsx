import React, { useEffect, useState } from 'react';
import { getAllReviews } from '../api/reviewsApi';

/**
 * "Trusted by People Who Found What They Lost"
 * Auto-scrolling marquee of success-story cards.
 *
 * How the seamless loop works:
 *   - The card array is rendered twice back-to-back.
 *   - The track is `width: max-content` so it overflows the section.
 *   - A CSS keyframe animates `translateX(-50%) → 0` (left-to-right
 *     motion). Because the second copy is identical to the first, the
 *     viewport never sees an edge — it loops invisibly.
 *   - `:hover` on the marquee container pauses the animation; cards
 *     scale up subtly.
 *   - A `mask-image` linear gradient fades the marquee edges so the
 *     cards softly emerge / dissolve instead of clipping abruptly.
 */

// Pull a city-ish token out of an address. Google "formatted_address" comes
// back like `JECRC University, Sitapura, Vidhani, Rajasthan, India` — we
// want something city-shaped, not the whole string.
const extractCity = (raw) => {
  if (!raw) return '';
  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return parts[0] || raw;
  if (parts.length >= 4) return parts[parts.length - 3]; // skip country + state
  return parts[1] || parts[0];
};

const SAMPLE_TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'Jaipur',
    item: 'Wallet',
    time: 'Found in 2 hours',
    story:
      'Lost my wallet at the railway station. Posted on ELIF, someone replied within an hour with a photo match.',
    rating: 5,
  },
  {
    name: 'Rohan Mehta',
    city: 'Mumbai',
    item: 'AirPods',
    time: 'Found in 1 day',
    story:
      'Left my AirPods in a cab. Got a notification next morning — driver had reported them. Saved me ₹15k.',
    rating: 5,
  },
  {
    name: 'Aisha Khan',
    city: 'Delhi',
    item: 'Backpack',
    time: 'Found in 4 hours',
    story:
      'Forgot my backpack with my laptop at a café. The barista uploaded it to ELIF before I even noticed.',
    rating: 5,
  },
  {
    name: 'Vikram Singh',
    city: 'Bangalore',
    item: 'Phone',
    time: 'Found in 30 minutes',
    story:
      'Dropped my phone in a metro station. The map filter showed a found-report 200 metres from where I was standing.',
    rating: 5,
  },
  {
    name: 'Ananya Iyer',
    city: 'Chennai',
    item: 'ID card',
    time: 'Found in 2 days',
    story:
      'My college ID was found by a stranger and posted here. Saved me a long process at the admin office.',
    rating: 5,
  },
  {
    name: 'Karan Patel',
    city: 'Ahmedabad',
    item: 'Car keys',
    time: 'Found in 6 hours',
    story:
      'Spent the whole afternoon retracing my steps. ELIF connected me with the security guard who picked them up.',
    rating: 5,
  },
  {
    name: 'Neha Reddy',
    city: 'Hyderabad',
    item: 'Laptop bag',
    time: 'Found in 1 day',
    story:
      'Forgot my work bag at the airport. The verification flow made the handover feel completely safe.',
    rating: 5,
  },
  {
    name: 'Arjun Kumar',
    city: 'Pune',
    item: 'Spectacles',
    time: 'Found in 3 hours',
    story:
      'My prescription glasses fell out in a park. Someone matched the photo from the lost-items page within hours.',
    rating: 4,
  },
  {
    name: 'Saanvi Gupta',
    city: 'Kolkata',
    item: 'Umbrella',
    time: 'Found in 1 hour',
    story:
      'Even something as small as an umbrella — recovered same day. Honestly didn’t expect a reply at all.',
    rating: 5,
  },
];

// Deterministic gradient picker so the same name always gets the same colour.
const AVATAR_GRADIENTS = [
  'from-rose-400 to-pink-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
];
const gradientFor = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
};

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    aria-hidden="true"
    className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-gray-200'}`}
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10.588 15.5a1 1 0 00-1.176 0l-3.366 2.523c-.785.57-1.84-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.06 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.288-3.957z" />
  </svg>
);

const Card = ({ name, city, item, time, story, rating, avatar }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <article className="group/card relative w-[320px] sm:w-[360px] flex-shrink-0 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] p-6 transition-transform duration-300 hover:scale-[1.025] hover:shadow-[0_12px_36px_-12px_rgba(15,23,42,0.18)]">
      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-3" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < rating} />
        ))}
      </div>

      {/* Story */}
      <p className="text-[15px] leading-relaxed text-gray-700">
        “{story}”
      </p>

      {/* Meta row */}
      <div className="mt-5 flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-10 w-10 rounded-full object-cover border border-white/60"
          />
        ) : (
          <div
            className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradientFor(
              name
            )} text-white text-sm font-semibold flex items-center justify-center select-none`}
            aria-hidden="true"
          >
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate">
            {city} · {item} · {time}
          </p>
        </div>
      </div>
    </article>
  );
};

// Map a `Review` document from the API into the card prop shape.
const reviewToCard = (r) => ({
  name: r.user?.username || 'ELIF user',
  city: extractCity(r.item?.address || r.item?.location) || '—',
  item: r.item?.name || 'Item',
  time: r.timeToRecover || 'Recently recovered',
  story: r.story,
  rating: r.rating,
  avatar: r.user?.avatar,
});

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getAllReviews()
      .then((data) => {
        if (cancelled) return;
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        // Soft-fail: section keeps working with sample data.
        console.warn('Testimonials fetch failed:', err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real reviews first, then samples to backfill so the marquee always
  // looks populated even on a fresh deployment with zero reviews.
  const liveCards = reviews.map(reviewToCard);
  const merged = [...liveCards, ...SAMPLE_TESTIMONIALS];
  // Render the array twice so a translateX of -50% loops seamlessly.
  const loop = [...merged, ...merged];
  return (
    <section className="relative py-4">
      <div className="text-center mb-10 animate-fadeInUp">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue mb-2">
          Testimonials
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
          Trusted by People Who Found What They Lost
        </h2>
        <p className="mt-3 text-base text-gray-600 max-w-xl mx-auto">
          Real stories from users who recovered valuables through ELIF.
        </p>
      </div>

      {/* Marquee */}
      <div
        className="marquee group relative overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
        }}
      >
        <div className="marquee-track flex gap-6 w-max py-4 will-change-transform">
          {loop.map((t, i) => (
            <Card key={i} {...t} />
          ))}
        </div>

        <style>{`
          @keyframes marquee-rtl {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .marquee-track {
            animation: marquee-rtl 60s linear infinite;
          }
          /* Pause when the user is reading */
          .marquee:hover .marquee-track {
            animation-play-state: paused;
          }
          @media (max-width: 640px) {
            .marquee-track { animation-duration: 38s; }
          }
          @media (prefers-reduced-motion: reduce) {
            .marquee-track { animation: none; transform: none; }
          }
        `}</style>
      </div>
    </section>
  );
};

export default Testimonials;
