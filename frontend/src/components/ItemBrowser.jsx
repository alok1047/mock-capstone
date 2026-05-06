import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ItemCard from './ItemCard';
import PlaceAutocomplete from './PlaceAutocomplete';
import { getNearbyItems } from '../api/itemsApi';
import useGeolocation from '../hooks/useGeolocation';

/**
 * Shared browser for /lost-items and /found-items.
 *
 * Only renders items reported within a 3 km radius of the user's current
 * location, status-filtered to lost or found. Items without geo data are
 * excluded by the backend ($geoNear requires it).
 *
 * If the user denies location, the page shows a permission CTA instead of
 * a list — there's no fallback to "all items" because the whole purpose of
 * the page is now proximity-based.
 */

const RADIUS_M = 3000;

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
  { value: 'documents', label: 'Documents' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'other', label: 'Other' },
];

const SearchIcon = () => (
  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PinIcon = () => (
  <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

const ItemBrowser = ({ kind }) => {
  const isLost = kind === 'lost';
  const {
    status: geoStatus,
    coords,
    request: requestGeo,
  } = useGeolocation({ auto: true });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const searchInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  // Override = user picked a different place to search around.
  const [override, setOverride] = useState(null); // { address, lat, lng } | null
  const [pickerOpen, setPickerOpen] = useState(false);

  // Resolve the centre we'll search around: override > GPS coords > none.
  const center = override
    ? { lat: override.lat, lng: override.lng, label: override.address }
    : coords
    ? { lat: coords.lat, lng: coords.lng, label: 'your current location' }
    : null;

  // Fetch nearby items whenever the active centre changes.
  useEffect(() => {
    // Still waiting for GPS — only relevant when no override is set.
    if (!override && (geoStatus === 'idle' || geoStatus === 'prompting')) {
      setLoading(true);
      return;
    }
    if (!center) {
      // No override and GPS denied/unavailable: show the permission CTA.
      setLoading(false);
      setItems([]);
      setError(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getNearbyItems({
          lat: center.lat,
          lng: center.lng,
          radius: RADIUS_M,
          status: isLost ? 'lost' : 'found',
        });
        if (!cancelled) {
          setItems(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Nearby fetch failed:', err);
        if (!cancelled) setError('Failed to load nearby items. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLost, geoStatus, coords?.lat, coords?.lng, override?.lat, override?.lng]);

  const handlePlacePicked = ({ address, lat, lng }) => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    setOverride({ address: address || 'selected location', lat, lng });
    setPickerOpen(false);
  };

  const resetToCurrentLocation = () => {
    setOverride(null);
    setPickerOpen(false);
    if (geoStatus !== 'granted') requestGeo();
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return items.filter((it) => {
      const matchSearch =
        !q ||
        it.name?.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q) ||
        it.location?.toLowerCase().includes(q) ||
        it.address?.toLowerCase().includes(q);
      const matchCategory =
        !category || it.category?.toLowerCase() === category;
      return matchSearch && matchCategory;
    });
  }, [items, searchTerm, category]);

  const isLocating =
    !override && (geoStatus === 'idle' || geoStatus === 'prompting');
  const blocked =
    !override &&
    (geoStatus === 'denied' ||
      geoStatus === 'unavailable' ||
      geoStatus === 'unsupported');
  const hasCenter = Boolean(center);

  // Auto-focus the search input when arriving with `?focus=search`
  // (e.g. from the homepage hero "Search Lost Items" button). Re-runs
  // when the input becomes available — the input only renders once
  // we have a centre.
  useEffect(() => {
    if (searchParams.get('focus') !== 'search') return;
    if (!hasCenter) return;
    const id = setTimeout(() => {
      const el = searchInputRef.current;
      if (!el) return;
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(id);
  }, [searchParams, hasCenter]);

  const blockedMessage = (() => {
    if (geoStatus === 'denied') {
      return 'You blocked location access — enable it in your browser, retry, or pick a place manually.';
    }
    if (geoStatus === 'unsupported') {
      return "Your browser doesn't support geolocation. Pick a place manually instead.";
    }
    // unavailable (timeout / position unavailable) — API works, this attempt failed
    return "We couldn't determine your location. Try again, or pick a place manually.";
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fadeInDown">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
            {isLost ? 'Lost reports' : 'Found reports'} · within 3 km
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            {isLost ? 'Lost items near you' : 'Found items near you'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 inline-flex items-center gap-1.5">
            {isLocating && 'Finding your location…'}
            {blocked && (
              <>
                <PinIcon /> Location is needed to show nearby items
              </>
            )}
            {hasCenter &&
              !loading &&
              `${filtered.length} ${filtered.length === 1 ? 'item' : 'items'}${
                searchTerm || category ? ' matching your filters' : ' within 3 km'
              }`}
          </p>
        </div>
        <Link
          to={isLost ? '/report-lost' : '/report-found'}
          className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md shadow-sm hover:shadow transition focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:ring-offset-2"
        >
          {isLost ? 'Report a lost item' : 'Report a found item'}
        </Link>
      </div>

      {/* Location-centre indicator + override controls.
          Visible whenever we have a centre OR when blocked (so the user
          can pick a place even if GPS is denied). */}
      {(hasCenter || blocked) && (
        <div className="space-y-3">
          {!pickerOpen && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <PinIcon />
              <span className="text-gray-700">
                Searching near{' '}
                <span className="font-medium text-gray-900">
                  {center?.label || 'a place you choose'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="ml-1 inline-flex items-center justify-center h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-gray-400 hover:text-gray-900 transition"
              >
                {override ? 'Change' : 'Search a different area'}
              </button>
              {override && (
                <button
                  type="button"
                  onClick={resetToCurrentLocation}
                  className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-gray-400 hover:text-gray-900 transition"
                >
                  Use my location
                </button>
              )}
            </div>
          )}

          {pickerOpen && (
            <div className="bg-white border border-gray-200 rounded-md p-3 max-w-xl">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Pick a place to search around
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
                <div className="flex-1 min-w-0">
                  <PlaceAutocomplete onChange={handlePlacePicked} />
                </div>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  className="inline-flex shrink-0 items-center justify-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Items within 3 km of the selected place will be shown.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters — search + category chips. Available whenever we have a centre. */}
      {hasCenter && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <SearchIcon />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, or location"
              className="w-full h-10 pl-9 pr-9 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat.value;
              return (
                <button
                  key={cat.value || 'all'}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-3 h-8 rounded-full border text-sm transition ${
                    active
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-brand-blue/40 hover:text-gray-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* States: locating / blocked / loading / error / empty / grid */}

      {isLocating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {blocked && !pickerOpen && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <PinIcon />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            We need a location to search
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-5">{blockedMessage}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            {geoStatus !== 'unsupported' && (
              <button
                type="button"
                onClick={requestGeo}
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md transition"
              >
                Try again
              </button>
            )}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition"
            >
              Search a different area
            </button>
          </div>
        </div>
      )}

      {hasCenter && loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {hasCenter && !loading && error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      {hasCenter && !loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {items.length === 0
              ? `No ${isLost ? 'lost' : 'found'} reports within 3 km`
              : 'No items match your filters'}
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {items.length === 0
              ? `Try a different area, or be the first to report ${
                  isLost ? 'a lost item' : 'a found item'
                } here.`
              : 'Try clearing the search or category filter.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            {items.length === 0 ? (
              <>
                <Link
                  to={isLost ? '/report-lost' : '/report-found'}
                  className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md transition"
                >
                  {isLost ? 'Report a lost item' : 'Report a found item'}
                </Link>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition"
                >
                  Search a different area
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCategory('');
                }}
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      )}

      {hasCenter && !loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <div key={item._id} style={{ animationDelay: `${idx * 60}ms` }}>
              <ItemCard
                id={item._id}
                title={item.name}
                image={item.image}
                location={item.address || item.location}
                date={item.createdAt}
                category={item.category}
                type={isLost ? 'lost' : 'found'}
                distance={typeof item.distance === 'number' ? item.distance : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemBrowser;
