import React, { useEffect, useRef, useState } from 'react';

/**
 * Two cute eyes that independently track the cursor.
 *
 * Each eye computes its own pupil offset from its own bounding box, so the
 * left and right pupils diverge slightly when you hover near the eyes — same
 * effect as a real pair of eyes. Movement is RAF-coalesced and clipped to
 * the sclera so the pupil can never escape.
 */
const EyeIcon = ({ className = 'h-7 w-12' }) => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const rafRef = useRef(0);
  const [offsets, setOffsets] = useState({
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 },
  });

  useEffect(() => {
    const offsetFor = (e, ref) => {
      const el = ref.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = Math.atan2(dy, dx);
      // Cap travel so pupil stays inside the iris ring
      const maxR = Math.min(rect.width, rect.height) * 0.18;
      const dist = Math.min(Math.hypot(dx, dy) / 6, maxR);
      // Slightly squash y so movement matches the eye's almond aspect
      return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.85 };
    };

    const onMove = (e) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setOffsets({
          left: offsetFor(e, leftRef),
          right: offsetFor(e, rightRef),
        });
      });
    };

    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // viewBox: 48 wide × 32 tall — two eyes side by side with a small gap.
  // Eye centres: left (12, 16), right (36, 16).
  return (
    <svg viewBox="0 0 48 32" className={className} aria-label="Eyes" role="img">
      <defs>
        <clipPath id="eye-left-clip">
          <ellipse cx="12" cy="16" rx="9" ry="10" />
        </clipPath>
        <clipPath id="eye-right-clip">
          <ellipse cx="36" cy="16" rx="9" ry="10" />
        </clipPath>
      </defs>

      {/* === Left eye === */}
      <g ref={leftRef}>
        <ellipse cx="12" cy="16" rx="9" ry="10" fill="#ffffff" />
        <g clipPath="url(#eye-left-clip)">
          <g style={{ transform: `translate(${offsets.left.x}px, ${offsets.left.y}px)`, transition: 'transform 90ms ease-out' }}>
            <circle cx="12" cy="16" r="5" fill="#1d4ed8" />
            <circle cx="12" cy="16" r="2.6" fill="#0b1220" />
            <circle cx="10.6" cy="14.6" r="1" fill="#ffffff" />
          </g>
        </g>
        <ellipse cx="12" cy="16" rx="9" ry="10" fill="none" stroke="#0b1220" strokeWidth="1.6" />
      </g>

      {/* === Right eye === */}
      <g ref={rightRef}>
        <ellipse cx="36" cy="16" rx="9" ry="10" fill="#ffffff" />
        <g clipPath="url(#eye-right-clip)">
          <g style={{ transform: `translate(${offsets.right.x}px, ${offsets.right.y}px)`, transition: 'transform 90ms ease-out' }}>
            <circle cx="36" cy="16" r="5" fill="#1d4ed8" />
            <circle cx="36" cy="16" r="2.6" fill="#0b1220" />
            <circle cx="34.6" cy="14.6" r="1" fill="#ffffff" />
          </g>
        </g>
        <ellipse cx="36" cy="16" rx="9" ry="10" fill="none" stroke="#0b1220" strokeWidth="1.6" />
      </g>

      {/* Tiny brow lashes for cuteness */}
      <path d="M5 6.5 C 8 4, 16 4, 19 6.5" fill="none" stroke="#0b1220" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M29 6.5 C 32 4, 40 4, 43 6.5" fill="none" stroke="#0b1220" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
};

export default EyeIcon;
