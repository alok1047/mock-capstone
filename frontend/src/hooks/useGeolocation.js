import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser geolocation hook with two layers of cache:
 *
 *   1. Module-level memory cache (60s) — shared across components within
 *      the same SPA session. Multiple components mounting at once only
 *      trigger one GPS read.
 *
 *   2. localStorage cache (5 min) — survives page reloads, hard refreshes,
 *      and tab restarts. The hook seeds itself from this cache instantly
 *      on mount, so /lost-items, /found-items, and the homepage feel
 *      instantaneous on the second visit.
 *
 * Why not Redis?
 *   The browser is the source of truth for the user's location — the
 *   backend never sees raw GPS. So a server-side cache wouldn't actually
 *   speed up `getCurrentPosition()`. localStorage gives us the same
 *   "instant after the first time" UX without a round-trip.
 *
 * status:
 *   'idle'         — not requested yet
 *   'prompting'    — waiting for the browser to resolve
 *   'granted'      — coords available
 *   'denied'       — user blocked permission (PERMISSION_DENIED)
 *   'unavailable'  — request failed (POSITION_UNAVAILABLE / TIMEOUT)
 *   'unsupported'  — `navigator.geolocation` is missing entirely
 */

const MEM_TTL_MS = 60 * 1000; // 1 min — within-session
const STORAGE_TTL_MS = 5 * 60 * 1000; // 5 min — cross-session
const STORAGE_KEY = 'elif:geo:v1';

let mem = null; // { coords, at }
let inflight = null;

const readStorage = () => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.coords || typeof data.at !== 'number') return null;
    if (Date.now() - data.at > STORAGE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
};

const writeStorage = (coords) => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ coords, at: Date.now() })
    );
  } catch {
    /* private mode / quota — ignore */
  }
};

const getFresh = () => {
  if (mem && Date.now() - mem.at < MEM_TTL_MS) return mem;
  const stored = readStorage();
  if (stored) {
    // Promote storage hit into the in-memory cache.
    mem = stored;
    return stored;
  }
  return null;
};

/**
 * Promise-based one-shot lookup — same cache layers as the hook, suitable
 * for click handlers (e.g. a "Use my location" button) that don't want to
 * subscribe to reactive state. Resolves with `{ lat, lng, accuracy }`.
 *
 * Errors carry the standard `code` from `GeolocationPositionError`
 * (1 = denied, 2 = unavailable, 3 = timeout) plus a custom `unsupported`
 * flag when the API is missing.
 */
export const getGeolocation = ({ timeoutMs = 18000 } = {}) =>
  fetchCoords(timeoutMs);

const fetchCoords = (timeoutMs) =>
  new Promise((resolve, reject) => {
    const fresh = getFresh();
    if (fresh) {
      resolve(fresh.coords);
      return;
    }
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
          mem = { coords, at: Date.now() };
          writeStorage(coords);
          inflight = null;
          res(coords);
        },
        (err) => {
          inflight = null;
          rej(err);
        },
        // Let the browser hand back any of its own cached position up to
        // STORAGE_TTL_MS old — this is what makes the actual GPS read
        // skip the satellite fix on second / third call.
        { enableHighAccuracy: false, maximumAge: STORAGE_TTL_MS, timeout: timeoutMs }
      );
    });
    inflight.then(resolve).catch(reject);
  });

const useGeolocation = ({ auto = true, timeoutMs = 12000 } = {}) => {
  // Seed synchronously from cache so first paint already has coords.
  const seed = getFresh();
  const [status, setStatus] = useState(seed ? 'granted' : 'idle');
  const [coords, setCoords] = useState(seed ? seed.coords : null);
  const [error, setError] = useState(null);
  const requestedRef = useRef(Boolean(seed));

  const request = useCallback(
    ({ force = false } = {}) => {
      if (force) {
        // User explicitly asked for a fresh fix — drop the in-memory cache
        // and let the browser decide whether its own positioning cache is
        // still valid (`maximumAge` on the SDK call still applies).
        mem = null;
      }
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
    },
    [timeoutMs]
  );

  useEffect(() => {
    if (!auto || requestedRef.current) return;
    requestedRef.current = true;
    request();
  }, [auto, request]);

  return { status, coords, error, request };
};

export default useGeolocation;
