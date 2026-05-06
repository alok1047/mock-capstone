import React, { useEffect, useState } from 'react';
import { submitReview, getEligibleClaims } from '../api/reviewsApi';

/**
 * Modal form for leaving a review on a successfully recovered item.
 *
 * Two ways to open it:
 *   - With `item` pre-set (from the Profile page's "Write a review" button
 *     on a specific approved claim) → the item picker is skipped.
 *   - Without `item` (e.g. from a generic "Share your story" CTA) → the
 *     modal first fetches /api/reviews/eligible and shows a small picker.
 *
 * On success, calls `onSubmitted(review)` so the parent can refresh.
 */

const Star = ({ filled, hovered, onClick, onMouseEnter, onMouseLeave }) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="p-0.5 transition-transform hover:scale-110"
    aria-label="Set rating"
  >
    <svg
      viewBox="0 0 20 20"
      className={`h-7 w-7 transition ${
        filled || hovered ? 'text-amber-400' : 'text-gray-200'
      }`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10.588 15.5a1 1 0 00-1.176 0l-3.366 2.523c-.785.57-1.84-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.06 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.288-3.957z" />
    </svg>
  </button>
);

const TIME_OPTIONS = [
  '30 minutes',
  '1 hour',
  '2 hours',
  'Same day',
  '1 day',
  '2 days',
  'Within a week',
];

const ReviewModal = ({ open, onClose, item, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [story, setStory] = useState('');
  const [timeToRecover, setTimeToRecover] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eligible, setEligible] = useState(null); // null = not loaded
  const [pickedItemId, setPickedItemId] = useState(item?._id || '');

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setRating(5);
    setHovered(0);
    setStory('');
    setTimeToRecover('');
    setError(null);
    setPickedItemId(item?._id || '');
    if (!item) {
      // Need to load eligible list
      setEligible(null);
      getEligibleClaims()
        .then((list) => setEligible(list || []))
        .catch((e) => {
          console.warn('Eligible fetch failed:', e);
          setEligible([]);
        });
    } else {
      setEligible([item]);
    }
  }, [open, item]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickedItemId) {
      setError('Please pick an item first.');
      return;
    }
    if (!story.trim()) {
      setError('Please share your story.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const review = await submitReview({
        itemId: pickedItemId,
        rating,
        story: story.trim(),
        timeToRecover: timeToRecover || undefined,
      });
      onSubmitted?.(review);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Could not submit your review.');
    } finally {
      setLoading(false);
    }
  };

  const showPicker = !item && (eligible?.length || 0) > 1;
  const noEligible = !item && eligible !== null && eligible.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Leave a review"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lift overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-blue">Testimonial</p>
            <h2 className="text-lg font-semibold text-gray-900 mt-0.5">Leave a review</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {noEligible && (
            <p className="text-sm text-gray-500">
              You can leave a review once an item you claimed has been approved
              by its owner.
            </p>
          )}

          {/* Item context (read-only when single item) or picker */}
          {item && !showPicker && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider">For your recovered item</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{item.name}</p>
            </div>
          )}
          {showPicker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Which item did you recover?
              </label>
              <select
                value={pickedItemId}
                onChange={(e) => setPickedItemId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-900 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              >
                <option value="">Select an item</option>
                {eligible.map((it) => (
                  <option key={it._id} value={it._id}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rating
            </label>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                return (
                  <Star
                    key={idx}
                    filled={idx <= rating}
                    hovered={idx <= hovered}
                    onClick={() => setRating(idx)}
                    onMouseEnter={() => setHovered(idx)}
                    onMouseLeave={() => setHovered(0)}
                  />
                );
              })}
            </div>
          </div>

          {/* Story */}
          <div>
            <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-1.5">
              Your story
            </label>
            <textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell others how ELIF helped you recover your item…"
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{story.length} / 500</p>
          </div>

          {/* Time to recover */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1.5">
              How quickly did you get it back?
            </label>
            <select
              id="time"
              value={timeToRecover}
              onChange={(e) => setTimeToRecover(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-900 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            >
              <option value="">Skip this</option>
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || noEligible}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md transition shadow-sm hover:shadow disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:ring-offset-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {loading ? 'Submitting' : 'Submit review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
