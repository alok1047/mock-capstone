import React, { useEffect, useRef, useState } from 'react';
import useGoogleMaps from '../hooks/useGoogleMaps';
import { getGeolocation } from '../hooks/useGeolocation';

/**
 * Google Places autocomplete using the new `PlaceAutocompleteElement`
 * web component, with a built-in "Use my location" button so users can
 * skip typing whenever they want — this component is reused across the
 * lost-report form, the lost/found browser's "search a different area"
 * picker, and anywhere else a place is needed.
 *
 * Emits `onChange({ address, lat, lng })`:
 *   - When the user picks a Google suggestion (`gmp-select` event)
 *   - When the user clicks "Use my location" (after reverse-geocoding the
 *     GPS coords into a human-readable address)
 *   - When the user types free text (so submitting without picking a
 *     suggestion still works)
 *
 * The element is a self-contained custom element with its own shadow DOM —
 * we mount it inside a host div and dress that host so it visually matches
 * the rest of the form fields.
 */

const PinIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-500" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1.07A6.002 6.002 0 0115.93 9H17a1 1 0 110 2h-1.07A6.002 6.002 0 0111 15.93V17a1 1 0 11-2 0v-1.07A6.002 6.002 0 014.07 11H3a1 1 0 110-2h1.07A6.002 6.002 0 019 4.07V3a1 1 0 011-1zm0 4a4 4 0 100 8 4 4 0 000-8z"
      clipRule="evenodd"
    />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const PlaceAutocomplete = ({
  onChange,
  disabled = false,
  id,
  className = '',
  showLocationButton = true,
}) => {
  const hostRef = useRef(null);
  const elRef = useRef(null);
  const { ready, error } = useGoogleMaps();
  const [importErr, setImportErr] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateErr, setLocateErr] = useState(null);

  useEffect(() => {
    if (!ready || !hostRef.current) return;
    // Snapshot — by the time cleanup runs the ref may have moved on.
    const host = hostRef.current;
    let cancelled = false;

    (async () => {
      let placesLib;
      try {
        placesLib = await window.google.maps.importLibrary('places');
      } catch (e) {
        if (!cancelled) setImportErr(e);
        return;
      }
      if (cancelled) return;

      const Ctor = placesLib.PlaceAutocompleteElement;
      if (!Ctor) {
        setImportErr(
          new Error('PlaceAutocompleteElement is missing from the places library')
        );
        return;
      }

      const el = new Ctor();
      if (id) el.id = id;
      el.style.width = '100%';
      elRef.current = el;
      host.replaceChildren(el);

      // Stable API: `gmp-select` with { placePrediction }.
      // Beta API: `gmp-placeselect` with { place }. Listen to both.
      const handleSelect = async (event) => {
        let place = null;
        if (event?.placePrediction?.toPlace) {
          place = event.placePrediction.toPlace();
        } else if (event?.place) {
          place = event.place;
        }
        if (!place) return;
        try {
          await place.fetchFields({
            fields: ['formattedAddress', 'displayName', 'location'],
          });
        } catch (e) {
          console.warn('Place.fetchFields failed:', e);
          return;
        }
        const address = place.formattedAddress || place.displayName || '';
        const lat = place.location?.lat?.();
        const lng = place.location?.lng?.();
        onChange?.({ address, lat, lng });
      };

      // Free-text fallback: keep state in sync even when no suggestion is picked.
      const handleInput = () => {
        const v = el.value || '';
        if (typeof v === 'string') {
          onChange?.({ address: v, lat: null, lng: null });
        }
      };

      el.addEventListener('gmp-select', handleSelect);
      el.addEventListener('gmp-placeselect', handleSelect);
      el.addEventListener('input', handleInput);
      elRef.current.__cleanup = () => {
        el.removeEventListener('gmp-select', handleSelect);
        el.removeEventListener('gmp-placeselect', handleSelect);
        el.removeEventListener('input', handleInput);
      };
    })();

    return () => {
      cancelled = true;
      elRef.current?.__cleanup?.();
      elRef.current = null;
      host.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Disable interaction when the parent says so
  useEffect(() => {
    if (elRef.current) elRef.current.style.pointerEvents = disabled ? 'none' : '';
  }, [disabled]);

  const handleUseMyLocation = async () => {
    if (locating) return;
    setLocateErr(null);
    setLocating(true);
    try {
      // Goes through the shared cache — instant when a recent fix exists.
      const { lat, lng } = await getGeolocation();

      // Reverse-geocode to a human-readable address. Fall back to a
      // "lat, lng" string if the geocoder is unavailable.
      let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      try {
        const geocodingLib = await window.google.maps.importLibrary('geocoding');
        const Geocoder = geocodingLib.Geocoder || window.google.maps.Geocoder;
        if (Geocoder) {
          const geocoder = new Geocoder();
          const { results } = await geocoder.geocode({ location: { lat, lng } });
          if (results?.[0]?.formatted_address) {
            address = results[0].formatted_address;
          }
        }
      } catch (e) {
        console.warn('Reverse geocode failed:', e);
      }

      // Reflect the new value in the autocomplete's own input field too.
      if (elRef.current && 'value' in elRef.current) {
        try {
          elRef.current.value = address;
        } catch {
          /* ignore */
        }
      }
      onChange?.({ address, lat, lng });
    } catch (err) {
      if (err?.unsupported) {
        setLocateErr("Your browser doesn't support geolocation.");
      } else if (err?.code === 1) {
        setLocateErr('Location permission denied. Allow access in your browser settings.');
      } else if (err?.code === 3) {
        setLocateErr(
          "Locating timed out. Try moving outside or near a window, or pick a place from the list above."
        );
      } else {
        setLocateErr(
          "We couldn't get your location. Try again, or pick a place from the list above."
        );
      }
    } finally {
      setLocating(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
        <p className="font-medium">Maps unavailable</p>
        <p className="text-xs mt-0.5 opacity-90">{error.message}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
        <div className="pae-host flex-1 min-w-0">
          <style>{`
            .pae-host { position: relative; z-index: 1; }
            .pae-host gmp-place-autocomplete {
              display: block;
              width: 100%;
              height: 2.5rem;
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 0.375rem;
              font: inherit;
              font-size: 0.875rem;
              color: #111827;
              color-scheme: light;
              transition: border-color 120ms ease, box-shadow 120ms ease;
            }
            .pae-host gmp-place-autocomplete:hover {
              border-color: #d1d5db;
            }
            .pae-host gmp-place-autocomplete:focus-within {
              border-color: #2563eb;
              box-shadow: 0 0 0 2px rgba(37,99,235,0.20);
              outline: none;
            }
            .pae-host gmp-place-autocomplete::part(input) {
              width: 100%;
              height: 100%;
              padding: 0 0.75rem;
              border: 0 !important;
              outline: 0 !important;
              background: transparent !important;
              box-shadow: none !important;
              font: inherit;
              color: inherit;
            }
          `}</style>
          <div ref={hostRef} />
          {!ready && (
            <div className="h-10 flex items-center px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-400">
              Loading places…
            </div>
          )}
        </div>

        {showLocationButton && (
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={disabled || locating || !ready}
            className="inline-flex shrink-0 items-center justify-center gap-2 h-10 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
          >
            {locating ? <Spinner /> : <PinIcon />}
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        )}
      </div>

      {importErr && (
        <p className="mt-1.5 text-xs text-rose-700">{importErr.message}</p>
      )}
      {locateErr && (
        <p className="mt-1.5 text-xs text-rose-700">{locateErr}</p>
      )}
    </div>
  );
};

export default PlaceAutocomplete;
