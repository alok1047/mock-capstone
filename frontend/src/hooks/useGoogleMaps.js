import { useEffect, useState } from 'react';

/**
 * Loads the Google Maps JS SDK once for the whole app.
 *
 * Uses Google's **inline bootstrap** pattern: we define a placeholder
 * `google.maps.importLibrary()` synchronously, and the real one is swapped
 * in by the SDK script as soon as it loads. Callers can `await
 * google.maps.importLibrary('places' | 'maps' | 'geocoding')` immediately;
 * the bootstrap handles the script load + queueing internally.
 *
 * Why not just append a <script> tag with `&libraries=places` and wait for
 * load? Because:
 *   - HMR can leave a stale tag whose `load` event already fired —
 *     `addEventListener('load', …)` then never resolves.
 *   - With `loading=async`, libraries listed in the URL aren't actually
 *     loaded until you call `importLibrary()` anyway.
 *   - The bootstrap pattern works even if the SDK was already loaded by
 *     another script (e.g. the user pasted a snippet).
 *
 * Returns { ready, error }. `ready` is true once `importLibrary` is
 * callable; library imports happen inside the components themselves.
 */

let bootstrapPromise = null;

const isReady = () =>
  typeof window !== 'undefined' &&
  typeof window.google?.maps?.importLibrary === 'function';

const bootstrap = (apiKey) => {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (isReady()) return Promise.resolve();
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = new Promise((resolve) => {
    // Establish the namespaces so we can attach a placeholder importLibrary.
    const w = window;
    w.google = w.google || {};
    w.google.maps = w.google.maps || {};
    const maps = w.google.maps;

    const libs = new Set();
    let scriptPromise = null;

    const loadScript = () => {
      if (scriptPromise) return scriptPromise;
      scriptPromise = new Promise((res, rej) => {
        const params = new URLSearchParams();
        if (libs.size) params.set('libraries', [...libs].join(','));
        params.set('key', apiKey);
        params.set('v', 'weekly');
        params.set('loading', 'async');
        params.set('callback', 'google.maps.__ib__');

        const script = document.createElement('script');
        script.id = 'gmaps-bootstrap';
        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.async = true;
        script.defer = true;
        // The SDK calls `google.maps.__ib__()` on load; that resolves us.
        maps.__ib__ = res;
        script.onerror = () => rej(new Error('Maps SDK could not load'));
        document.head.appendChild(script);
      });
      return scriptPromise;
    };

    // Placeholder importLibrary — triggers the script load on first call,
    // then delegates to the SDK's real importLibrary that overwrites it.
    maps.importLibrary = (name, ...rest) => {
      libs.add(name);
      return loadScript().then(() => maps.importLibrary(name, ...rest));
    };

    // The bootstrap itself is now ready — `importLibrary` is callable.
    resolve();
  }).catch((e) => {
    // Reset so a future call can retry
    bootstrapPromise = null;
    throw e;
  });

  return bootstrapPromise;
};

const useGoogleMaps = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [ready, setReady] = useState(isReady);
  const [error, setError] = useState(
    !apiKey ? new Error('VITE_GOOGLE_MAPS_API_KEY is not set') : null
  );

  useEffect(() => {
    if (ready || error) return;
    let cancelled = false;
    bootstrap(apiKey)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, ready, error]);

  return { ready, error };
};

export default useGoogleMaps;
