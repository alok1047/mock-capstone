import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import useGeolocation from '../hooks/useGeolocation';

// Fix default Leaflet marker icon (Vite doesn't bundle it correctly by default)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [26.9124, 75.7873]; // Jaipur

/**
 * Reverse-geocode (lat, lng) → address via Nominatim (free, no API key).
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data?.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

/**
 * Inner component that handles map clicks and updates the marker position.
 */
const MapClickHandler = ({ disabled, onLocationChange }) => {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/**
 * Pans the map to a new center when it changes.
 */
const RecenterMap = ({ lat, lng, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], zoom || 16, { duration: 0.8 });
    }
  }, [lat, lng, zoom, map]);
  return null;
};

/**
 * Interactive map for marking the EXACT location something was found.
 *
 * Uses Leaflet + OpenStreetMap tiles (completely free, no API key).
 * Emits `onChange({ address, lat, lng })` whenever the marker moves
 * (drag, map click, or "use my location").
 */
const LocationPicker = ({ value, onChange, disabled = false }) => {
  const { coords: gpsCoords, request: requestGps, status: gpsStatus } =
    useGeolocation({ auto: false });

  const [pos, setPos] = useState(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null
  );
  const [address, setAddress] = useState(value?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  const markerPos = pos || { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };

  const handleLocationChange = async (lat, lng) => {
    setPos({ lat, lng });
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    onChange?.({ address: addr, lat, lng });
  };

  const handleMarkerDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    handleLocationChange(lat, lng);
  };

  // When GPS resolves, jump there
  useEffect(() => {
    if (!gpsCoords) return;
    handleLocationChange(gpsCoords.lat, gpsCoords.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsCoords]);

  // Search via Nominatim (debounced)
  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(searchTimeout.current);
    if (q.trim().length < 3) {
      setSearchResults([]);
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
        setSearchResults(data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setPos({ lat, lng });
    setAddress(result.display_name);
    onChange?.({ address: result.display_name, lat, lng });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search a place…"
            disabled={disabled}
            className="w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50"
          />
          {searchResults.length > 0 && (
            <ul className="absolute z-[1000] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSearchSelect(r)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-brand-blue transition truncate"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>

        {/* Use my location button */}
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

      {/* Leaflet Map */}
      <div className="relative w-full h-64 sm:h-72 rounded-md overflow-hidden border border-gray-200">
        <MapContainer
          center={pos ? [pos.lat, pos.lng] : DEFAULT_CENTER}
          zoom={pos ? 16 : 13}
          className="h-full w-full"
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[markerPos.lat, markerPos.lng]}
            draggable={!disabled}
            eventHandlers={{ dragend: handleMarkerDragEnd }}
          />
          <MapClickHandler disabled={disabled} onLocationChange={handleLocationChange} />
          {pos && <RecenterMap lat={pos.lat} lng={pos.lng} zoom={16} />}
        </MapContainer>
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
