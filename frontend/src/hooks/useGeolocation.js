import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser geolocation hook with explicit states + a small module-level
 * cache so multiple components that auto-request location share a single
 * underlying GPS read.
 *
 * status:
 *   'idle'         — not requested yet
 *   'prompting'    — waiting for the browser to resolve
 *   'granted'      — coords available
 *   'denied'       — user blocked permission (PERMISSION_DENIED)
 *   'unavailable'  — request failed (POSITION_UNAVAILABLE / TIMEOUT)
 *   'unsupported'  — `navigator.geolocation` is missing entirely
 *
 * Why the cache?
 *   - Components like ItemBrowser auto-request on mount. Navigating
 *     between /lost-items and /found-items used to re-prompt every time.
 *   - React StrictMode double-mounts components in dev; without a cache
 *     that's two getCurrentPosition() calls per render.
 *   - A 60-second TTL keeps coords fresh enough for a 3 km radius without
 *     spamming the browser/permissions UI.
 */

const CACHE_TTL_MS = 60_000;

let cached = null; // { coords: { lat, lng, accuracy }, at: number }
let inflight = null; // Promise<{lat,lng,accuracy}> | null

const fetchCoords = (timeoutMs) =>
  new Promise((resolve, reject) => {
    // Fresh hit from cache?
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      resolve(cached.coords);
      return;
    }
    // Already a request in flight? Share it.
    if (inflight) {
      inflight.then(resolve).catch(reject);
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const err = new Error('Geolocation API not available');
      err.unsupported = true;
      reject(err);
      return;
    }

    inflight = new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          cached = { coords, at: Date.now() };
          inflight = null;
          res(coords);
        },
        (err) => {
          inflight = null;
          rej(err);
        },
        { enableHighAccuracy: false, maximumAge: CACHE_TTL_MS, timeout: timeoutMs }
      );
    });
    inflight.then(resolve).catch(reject);
  });

const useGeolocation = ({ auto = true, timeoutMs = 15000 } = {}) => {
  // Seed from cache if it's still fresh — no flicker, no re-prompt.
  const seedFromCache = cached && Date.now() - cached.at < CACHE_TTL_MS;
  const [status, setStatus] = useState(seedFromCache ? 'granted' : 'idle');
  const [coords, setCoords] = useState(seedFromCache ? cached.coords : null);
  const [error, setError] = useState(null);
  const requestedRef = useRef(seedFromCache);

  const request = useCallback(() => {
    setStatus('prompting');
    setError(null);
    fetchCoords(timeoutMs).then(
      (c) => {
        setCoords(c);
        setStatus('granted');
      },
      (err) => {
        setError(err);
        if (err?.unsupported) setStatus('unsupported');
        else if (err?.code === 1) setStatus('denied');
        else setStatus('unavailable');
      }
    );
  }, [timeoutMs]);

  useEffect(() => {
    if (!auto || requestedRef.current) return;
    requestedRef.current = true;
    request();
  }, [auto, request]);

  return { status, coords, error, request };
};

export default useGeolocation;
