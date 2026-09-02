import React, { useRef, useState } from 'react';
import { getGeolocation } from '../hooks/useGeolocation';

/**
 * Place autocomplete powered by Nominatim (OpenStreetMap) — completely free,
 * no API key required.
 *
 * Emits `onChange({ address, lat, lng })`:
 *   - When the user picks a result from the dropdown
 *   - When the user clicks "Use my location"
 *   - When the user types free text (lat/lng will be null)
 *
 * Drop-in replacement for the old Google PlaceAutocompleteElement version —
 * same prop interface, same event shape.
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
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateErr, setLocateErr] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  const handleBlur = (e) => {
    // Small delay so click on result registers before closing
    setTimeout(() => {
      if (wrapperRef.current && !wrapperRef.current.contains(document.activeElement)) {
        setShowDropdown(false);
      }
    }, 200);
  };

  const handleInputChange = (e) => {
    const q = e.target.value;
    setQuery(q);

    // Emit free-text so parent has something even without a pick
    onChange?.({ address: q, lat: null, lng: null });

    clearTimeout(searchTimeout.current);
    if (q.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setResults(data || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const address = result.display_name;
    setQuery(address);
    setResults([]);
    setShowDropdown(false);
    onChange?.({ address, lat, lng });
  };

  const handleUseMyLocation = async () => {
    if (locating) return;
    setLocateErr(null);
    setLocating(true);
    try {
      const { lat, lng } = await getGeolocation();

      // Reverse-geocode via Nominatim
      let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data?.display_name) {
          address = data.display_name;
        }
      } catch {
        // keep fallback coords string
      }

      setQuery(address);
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

  return (
    <div className={className} ref={wrapperRef}>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <input
            id={id}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder="Search a place… e.g. Railway station Jaipur"
            className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50"
          />

          {/* Dropdown */}
          {showDropdown && results.length > 0 && (
            <ul className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                    onClick={() => handleSelect(r)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand-blue transition truncate"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Spinner */}
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner />
            </div>
          )}
        </div>

        {/* Use my location */}
        {showLocationButton && (
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={disabled || locating}
            className="inline-flex shrink-0 items-center justify-center gap-2 h-10 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
          >
            {locating ? <Spinner /> : <PinIcon />}
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        )}
      </div>

      {locateErr && (
        <p className="mt-1.5 text-xs text-rose-700">{locateErr}</p>
      )}
    </div>
  );
};

export default PlaceAutocomplete;
