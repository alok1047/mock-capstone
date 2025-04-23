import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../api/itemsApi';
import { useAuth } from '../contexts/AuthContext';

const ReportFound = () => {
  const navigate = useNavigate();
  // Get current user for reporting
  const { currentUser } = useAuth();
  
  // Ensure user is authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: '/report-found' } } });
    }
  }, [currentUser, navigate]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    category: 'other',
  });
  
  // File state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Available categories
  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'bags', label: 'Bags' },
    { value: 'documents', label: 'Documents' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'other', label: 'Other' }
  ];
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle file input changes
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file type
    if (file && !file.type.match('image.*')) {
      setError('Please select an image file (PNG, JPG, JPEG)');
      return;
    }
    
    // Validate file size (10MB max)
    if (file && file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }
    
    if (file) {
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clear any previous errors
      setError(null);
    }
  };
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file (PNG, JPG, JPEG)');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clear any previous errors
      setError(null);
    }
  };
  
  // Prevent default behavior for drag events
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !formData.description.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API - add status as "found" and image
      const itemData = {
        ...formData,
        status: 'found', // Set the status as found
        image: image     // Add the image file
      };
      
      // Submit to API
      await createItem(itemData);
      
      // Show success state
      setSubmitted(true);
      
      // Reset form after success
      setFormData({
        name: '',
        description: '',
        location: '',
        category: 'other'
      });
      setImage(null);
      setImagePreview(null);
      
      // Show success message briefly, then redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error reporting found item:', err);
      setError(err.message || 'Failed to report item. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-500 rounded-full mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        Report Found Item
      </h1>
      
      {/* Success Message */}
      {submitted && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 text-green-700">
                Your found item has been reported successfully! Redirecting to dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm leading-5 text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Report Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
            placeholder="What did you find?"
            disabled={loading || submitted}
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
            placeholder="Describe the item in detail: color, size, distinguishing features, etc."
            disabled={loading || submitted}
          ></textarea>
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
            placeholder="Where did you find it?"
            disabled={loading || submitted}
          />
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
            disabled={loading || submitted}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <div 
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${imagePreview ? 'border-green-300' : 'border-gray-300 border-dashed'} rounded-md`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {imagePreview ? (
              <div className="text-center">
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
                  className="text-sm text-red-500 hover:text-red-700 focus:outline-none"
                  disabled={loading || submitted}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-brand-blue hover:text-brand-blue-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-blue"
                  >
                    <span>Upload an image</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={loading || submitted} 
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
            disabled={loading || submitted}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            disabled={loading || submitted}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Report Found Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportFound;