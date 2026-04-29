import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../api/itemsApi';
import { useAuth } from '../contexts/AuthContext';
import Select from './Select';

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
  'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 transition focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50';

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
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
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
      await createItem({ ...formData, status: kind, image });
      setSubmitted(true);
      setFormData({ name: '', description: '', location: '', category: 'other' });
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
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
              Location <span className="text-gray-400">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              disabled={disabled}
              value={formData.location}
              onChange={onChange}
              placeholder={isLost ? 'Where did you lose it?' : 'Where did you find it?'}
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={onChange}
              options={CATEGORIES}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Image upload */}
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
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  disabled={disabled}
                  className="text-sm text-gray-500 hover:text-gray-900 transition"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer px-6 py-10 text-center"
              >
                <svg
                  className="h-10 w-10 text-gray-300 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB</p>
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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={disabled}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-md transition disabled:opacity-50"
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? 'Submitting…' : isLost ? 'Report lost item' : 'Report found item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportItemForm;
