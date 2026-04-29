import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../api/itemsApi';
import { useAuth } from '../contexts/AuthContext';
import PlaceAutocomplete from './PlaceAutocomplete';
import LocationPicker from './LocationPicker';
import CameraCapture from './CameraCapture';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
  { value: 'documents', label: 'Documents' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'other', label: 'Other' },
];

const inputClass =
  'w-full h-10 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50';

const textareaClass =
  'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:opacity-50 resize-y';

/**
 * Shared report form for both lost and found items.
 * `kind` controls the copy and the status submitted to the API.
 */
const ReportItemForm = ({ kind = 'lost' }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isLost = kind === 'lost';

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: isLost ? '/report-lost' : '/report-found' } } });
    }
  }, [currentUser, navigate, isLost]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    category: 'other',
    address: '',
    lat: '',
    lng: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Receives { address, lat, lng } from PlaceAutocomplete / LocationPicker.
  // We mirror `address` into the human-readable `location` field so the
  // existing list/search code keeps working unchanged.
  const onPlaceChange = ({ address, lat, lng }) => {
    setFormData((p) => ({
      ...p,
      address: address || '',
      location: address || p.location,
      lat: lat ?? '',
      lng: lng ?? '',
    }));
  };

  const acceptFile = (file) => {
    if (!file) return;
    if (!file.type.match('image.*')) {
      setError('Please select an image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const onFileChange = (e) => acceptFile(e.target.files[0]);
  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) acceptFile(e.dataTransfer.files[0]);
  };
  const onDragOver = (e) => e.preventDefault();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Drop empty coords so the backend doesn't try to validate them.
      const payload = { ...formData, status: kind, image };
      if (payload.lat === '' || payload.lng === '') {
        delete payload.lat;
        delete payload.lng;
      }
      if (!payload.address) delete payload.address;
      await createItem(payload);
      setSubmitted(true);
      setFormData({
        name: '',
        description: '',
        location: '',
        category: 'other',
        address: '',
        lat: '',
        lng: '',
      });
      setImage(null);
      setImagePreview(null);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Report submission failed:', err);
      setError(err.message || 'Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || submitted;

  return (
    <>
    <CameraCapture
      open={cameraOpen}
      onClose={() => setCameraOpen(false)}
      onCapture={(file) => acceptFile(file)}
    />
    <div className="max-w-2xl mx-auto animate-fadeInUp">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          {isLost ? 'Lost report' : 'Found report'}
        </p>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          {isLost ? 'Report a lost item' : 'Report a found item'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLost
            ? 'Provide as much detail as you can to help others identify it.'
            : 'Share details so the rightful owner can claim it.'}
        </p>
      </div>

      {/* Banners */}
      {submitted && (
        <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">
            Reported successfully. Redirecting to your dashboard…
          </p>
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm text-rose-800">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Item name <span className="text-gray-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            disabled={disabled}
            value={formData.name}
            onChange={onChange}
            placeholder={isLost ? 'What did you lose?' : 'What did you find?'}
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-gray-400">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            disabled={disabled}
            value={formData.description}
            onChange={onChange}
            placeholder="Color, size, distinguishing features…"
            className={textareaClass}
          />
        </div>

        {/* Location — autocomplete for lost, draggable map for found */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
            Location <span className="text-gray-400">*</span>
          </label>
          {isLost ? (
            <>
              <PlaceAutocomplete
                id="location"
                name="location"
                value={formData.location}
                onChange={onPlaceChange}
                disabled={disabled}
                placeholder="Search a place… e.g. Railway station Jaipur"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Pick the closest place where you last had it.
              </p>
            </>
          ) : (
            <>
              <LocationPicker
                value={{ address: formData.address, lat: formData.lat, lng: formData.lng }}
                onChange={onPlaceChange}
                disabled={disabled}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Drag the pin or tap the map to mark the exact spot you found it.
              </p>
            </>
          )}
        </div>

        {/* Category — pill chips: cleaner UX than a dropdown for 7 fixed options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = formData.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ target: { name: 'category', value: cat.value } })}
                  className={`px-3 h-8 rounded-full border text-sm transition disabled:opacity-50 ${
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

        {/* Image upload — drag/drop, file picker, OR direct camera capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`relative rounded-md border border-dashed transition ${
              imagePreview ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-50 hover:bg-white'
            }`}
          >
            {imagePreview ? (
              <div className="p-4 text-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 max-w-full mx-auto rounded-md mb-3"
                />
                <div className="flex justify-center gap-3">
                  <label
                    htmlFor="file-replace"
                    className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer transition"
                  >
                    Replace
                    <input
                      id="file-replace"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={onFileChange}
                      disabled={disabled}
                    />
                  </label>
                  <span className="text-gray-300">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    disabled={disabled}
                    className="text-sm text-rose-600 hover:text-rose-700 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                <svg
                  className="h-10 w-10 text-gray-300 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm text-gray-700 mb-3">
                  Add a photo of the item
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  {/* Opens our CameraCapture modal — actually requests
                      camera permission and shows a live preview, instead
                      of the OS file picker. Works on desktop AND mobile. */}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setCameraOpen(true)}
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md transition disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h2.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 0110.414 5h3.172a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Take photo
                  </button>

                  {/* Plain file picker — uploads from gallery / disk. */}
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md cursor-pointer transition disabled:opacity-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={onFileChange}
                      disabled={disabled}
                    />
                  </label>
                </div>

                <p className="text-xs text-gray-400 mt-3">PNG, JPG, JPEG up to 10MB · or drag &amp; drop</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer — Cancel (secondary) + primary submit. Both share h-10 so
            they sit on a clean baseline. Focus ring uses the brand neutral. */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 -mx-6 sm:-mx-8 px-6 sm:px-8 pt-5 mt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={disabled}
            className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 min-w-[160px] text-sm font-medium tracking-tight text-white bg-brand-blue hover:bg-brand-blue-dark rounded-md transition shadow-sm hover:shadow disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting
              </>
            ) : (
              <>
                {isLost ? 'Report lost item' : 'Report found item'}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 -mr-0.5" aria-hidden="true">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default ReportItemForm;
