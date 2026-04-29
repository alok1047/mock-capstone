import React, { useEffect, useRef, useState } from 'react';

/**
 * Modal that opens the device camera via `getUserMedia`, shows a live
 * preview, and emits the captured frame as a `File` (JPEG) through
 * `onCapture(file)`.
 *
 * Why not just <input type="file" capture="environment">?
 *   That works on mobile (opens the system camera UI) but on desktop most
 *   browsers fall back to the regular file picker — which is what the user
 *   reported. `getUserMedia` works on every modern browser and gives the
 *   same camera-permission flow on phones, tablets, and laptops.
 *
 * Permission flow:
 *   - First call → browser shows its native permission prompt.
 *   - Allowed → live preview, capture button enables.
 *   - Denied / no camera → friendly fallback with a helpful message.
 *
 * The stream is always stopped on close / unmount so the camera light
 * turns off promptly.
 */

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h2.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 0110.414 5h3.172a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SwitchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-3M20 15a8 8 0 01-14 3" />
  </svg>
);

const CameraCapture = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [facing, setFacing] = useState('environment'); // rear by default

  // Start / stop stream as `open` and `facing` change
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera access.');
      return undefined;
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        // Stop any prior stream (when switching cameras)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          // Inline play required for iOS Safari
          v.playsInline = true;
          v.muted = true;
          await v.play().catch(() => {});
          setReady(true);
        }
      } catch (e) {
        if (cancelled) return;
        if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
          setError(
            'Camera permission denied. Allow camera access in your browser settings, then try again.'
          );
        } else if (e?.name === 'NotFoundError' || e?.name === 'DevicesNotFoundError') {
          setError('No camera found on this device.');
        } else if (e?.name === 'NotReadableError' || e?.name === 'TrackStartError') {
          setError('Camera is in use by another application.');
        } else {
          setError(`Could not start camera: ${e?.message || 'unknown error'}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, facing]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !ready) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        onCapture?.(file);
        onClose?.();
      },
      'image/jpeg',
      0.92
    );
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-lift">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CameraIcon />
            <p className="text-sm font-semibold text-gray-900">Take a photo</p>
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

        {/* Preview */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {error ? (
            <div className="text-center px-6 py-10 text-white/90 max-w-md">
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70 text-xs">
                  Waiting for camera…
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!error && (
              <button
                type="button"
                onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
                title="Switch camera"
                className="inline-flex items-center justify-center h-10 w-10 text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
                aria-label="Switch camera"
              >
                <SwitchIcon />
              </button>
            )}
            <button
              type="button"
              onClick={handleCapture}
              disabled={!ready || !!error}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md transition shadow-sm hover:shadow disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:ring-offset-2"
            >
              <CameraIcon />
              Capture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
