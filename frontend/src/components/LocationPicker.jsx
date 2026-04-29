import React, { useEffect, useRef, useState } from 'react';
import useGoogleMaps from '../hooks/useGoogleMaps';
import useGeolocation from '../hooks/useGeolocation';

/**
 * Interactive map for marking the EXACT location something was found.
 *
 * - Search box uses the new `PlaceAutocompleteElement` web component
 *   (legacy `Autocomplete` is unavailable to projects created after
 *   March 1, 2025 and silently fails for them).
 * - Map + Marker + Geocoder remain on the still-supported APIs.
 *
 * Emits `onChange({ address, lat, lng })` whenever the marker moves
 * (drag, map click, place pick, or "use my location").
 */
const DEFAULT_CENTER = { lat: 26.9124, lng: 75.7873 }; // Jaipur

const LocationPicker = ({ value, onChange, disabled = false }) => {
  const { ready, error } = useGoogleMaps();
  const { coords: gpsCoords, request: requestGps, status: gpsStatus } =
    useGeolocation({ auto: false });

  const mapDivRef = useRef(null);
  const searchHostRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const acElRef = useRef(null);

  const [pos, setPos] = useState(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null
  );
  const [address, setAddress] = useState(value?.address || '');

  // Reverse-geocode (lat, lng) → human-readable address.
  const reverseGeocode = (lat, lng) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      const a = status === 'OK' && results?.[0]?.formatted_address;
      const next = a || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(next);
      onChange?.({ address: next, lat, lng });
    });
  };

  const [importErr, setImportErr] = useState(null);

  // ---- Initialise once SDK is ready ----
  useEffect(() => {
    if (!ready || mapRef.current || !mapDivRef.current) return;
    let cancelled = false;

    (async () => {
      let mapsLib, placesLib, geocodingLib, markerLib;
      try {
        [mapsLib, placesLib, geocodingLib, markerLib] = await Promise.all([
          window.google.maps.importLibrary('maps'),
          window.google.maps.importLibrary('places'),
          window.google.maps.importLibrary('geocoding'),
          window.google.maps.importLibrary('marker'),
        ]);
      } catch (e) {
        if (!cancelled) setImportErr(e);
        return;
      }
      if (cancelled) return;

      const MapCtor = mapsLib.Map || window.google.maps.Map;
      const GeocoderCtor = geocodingLib.Geocoder || window.google.maps.Geocoder;
      const AdvancedMarker = markerLib?.AdvancedMarkerElement;
      const LegacyMarker = mapsLib.Marker || window.google.maps.Marker;
      const PlaceAutoCtor = placesLib.PlaceAutocompleteElement;

      if (!MapCtor || !GeocoderCtor) {
        setImportErr(new Error('Required Maps constructors not available'));
        return;
      }

      geocoderRef.current = new GeocoderCtor();

      const initialCenter = pos || DEFAULT_CENTER;
      const envMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';
      // mapId is only valid when we actually have an AdvancedMarkerElement
      // implementation — otherwise the map silently strips legacy `styles`.
      const useAdvanced = Boolean(AdvancedMarker);
      const map = new MapCtor(mapDivRef.current, {
        center: initialCenter,
        zoom: pos ? 16 : 13,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        gestureHandling: 'cooperative',
        ...(useAdvanced
          ? { mapId: envMapId }
          : {
              // Legacy path keeps the soft styling (POI/transit hidden).
              styles: [
                { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                { featureType: 'transit', stylers: [{ visibility: 'off' }] },
              ],
            }),
      });
      mapRef.current = map;

      // Try AdvancedMarkerElement first; fall back to legacy Marker if the
      // construction throws (e.g. marker library partially loaded, or the
      // mapId is rejected).
      let marker;
      try {
        if (useAdvanced) {
          marker = new AdvancedMarker({
            map,
            position: initialCenter,
            gmpDraggable: !disabled,
          });
        } else if (LegacyMarker) {
          marker = new LegacyMarker({
            map,
            position: initialCenter,
            draggable: !disabled,
          });
        } else {
          throw new Error('No marker implementation available');
        }
      } catch (err) {
        console.warn('AdvancedMarker failed, falling back:', err);
        if (LegacyMarker) {
          marker = new LegacyMarker({
            map,
            position: initialCenter,
            draggable: !disabled,
          });
        } else {
          setImportErr(err);
          return;
        }
      }
      markerRef.current = marker;
      const isAdvancedMarker = !!AdvancedMarker && marker instanceof AdvancedMarker;

      const setMarkerPos = ({ lat, lng }) => {
        if (isAdvancedMarker) marker.position = { lat, lng };
        else marker.setPosition({ lat, lng });
      };
      const getMarkerPos = () => {
        if (isAdvancedMarker) {
          const p = marker.position;
          if (!p) return null;
          return {
            lat: typeof p.lat === 'function' ? p.lat() : p.lat,
            lng: typeof p.lng === 'function' ? p.lng() : p.lng,
          };
        }
        const p = marker.getPosition?.();
        return p ? { lat: p.lat(), lng: p.lng() } : null;
      };
      // Expose for the gpsCoords effect below
      markerRef.current.__setPos = setMarkerPos;

      if (pos) onChange?.({ address, lat: pos.lat, lng: pos.lng });

      marker.addListener('dragend', () => {
        const p = getMarkerPos();
        if (!p) return;
        setPos(p);
        reverseGeocode(p.lat, p.lng);
      });

      map.addListener('click', (e) => {
        if (disabled) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });
        setPos({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Mount the new PlaceAutocompleteElement search box
      if (PlaceAutoCtor && searchHostRef.current) {
        const el = new PlaceAutoCtor();
        el.style.width = '100%';
        acElRef.current = el;
        searchHostRef.current.replaceChildren(el);

        const onSelect = async (event) => {
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
          } catch (err) {
            console.warn('Place.fetchFields failed:', err);
            return;
          }
          const loc = place.location;
          if (!loc) return;
          const lat = loc.lat();
          const lng = loc.lng();
          const a = place.formattedAddress || place.displayName || '';
          map.panTo({ lat, lng });
          map.setZoom(16);
          setMarkerPos({ lat, lng });
          setPos({ lat, lng });
          setAddress(a);
          onChange?.({ address: a, lat, lng });
        };

        el.addEventListener('gmp-select', onSelect);
        el.addEventListener('gmp-placeselect', onSelect);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // When useGeolocation resolves, jump the map there.
  useEffect(() => {
    if (!gpsCoords || !mapRef.current || !markerRef.current) return;
    const { lat, lng } = gpsCoords;
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(16);
    markerRef.current.__setPos?.({ lat, lng });
    setPos({ lat, lng });
    reverseGeocode(lat, lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsCoords]);

  const showError = error || importErr;
  if (showError) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
        <p className="font-medium">Map unavailable</p>
        <p className="text-xs mt-0.5 opacity-90">{showError.message}</p>
        <p className="text-xs mt-1.5 opacity-75">
          If you just edited <code>frontend/.env</code>, restart <code>npm run dev</code> — Vite only reads env on startup.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
        {/* Match the search box to our form-input look exactly. */}
        <style>{`
          .lp-search-host { flex: 1 1 0%; min-width: 0; }
          .lp-search-host { position: relative; z-index: 2; }
          .lp-search-host gmp-place-autocomplete {
            display: block;
            width: 100%;
            height: 2.5rem;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font: inherit;
            font-size: 0.875rem;
            color: #111827;
            /* Force light theme so the suggestions dropdown stays white. */
            color-scheme: light;
            /* No overflow:hidden — clips the suggestions dropdown. */
            transition: border-color 120ms ease, box-shadow 120ms ease;
          }
          .lp-search-host gmp-place-autocomplete:hover {
            border-color: #d1d5db;
          }
          .lp-search-host gmp-place-autocomplete:focus-within {
            border-color: #2563eb;
            box-shadow: 0 0 0 2px rgba(37,99,235,0.20);
            outline: none;
          }
          .lp-search-host gmp-place-autocomplete::part(input) {
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
        <div ref={searchHostRef} className="lp-search-host" />
        <button
          type="button"
          onClick={requestGps}
          disabled={disabled || gpsStatus === 'prompting'}
          className="inline-flex shrink-0 items-center justify-center gap-2 h-10 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-500" aria-hidden="true">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.07A6.002 6.002 0 0115.93 9H17a1 1 0 110 2h-1.07A6.002 6.002 0 0111 15.93V17a1 1 0 11-2 0v-1.07A6.002 6.002 0 014.07 11H3a1 1 0 110-2h1.07A6.002 6.002 0 019 4.07V3a1 1 0 011-1zm0 4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd"/>
          </svg>
          {gpsStatus === 'prompting' ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      <div
        ref={mapDivRef}
        className={`relative w-full h-64 sm:h-72 rounded-md overflow-hidden border border-gray-200 bg-gray-100 ${
          !ready ? 'animate-pulse' : ''
        }`}
      >
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
            Loading map…
          </div>
        )}
      </div>

      {address && (
        <p className="text-xs text-gray-500 truncate">
          <span className="font-medium text-gray-700">Pinned:</span> {address}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
