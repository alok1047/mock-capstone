import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItemById, claimItem, respondToClaim, updateItem, deleteItem } from '../api/itemsApi';
import { useAuth } from '../contexts/AuthContext';

// Icons
const LostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const FoundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClaimedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ItemDetail = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [processingClaimId, setProcessingClaimId] = useState(null);
  const [claimActionError, setClaimActionError] = useState(null);
  const [claimActionSuccess, setClaimActionSuccess] = useState(false);
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    location: '',
    category: '',
    status: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle approving a claim
  const handleApproveClaim = async (claimId) => {
    if (!isAuthenticated || !isOwner) {
      return;
    }
    
    try {
      setProcessingClaimId(claimId);
      setClaimActionError(null);
      
      await respondToClaim(id, claimId, { 
        status: 'approved',
        responseMessage: 'Your claim has been approved. Please contact the item owner for further instructions.'
      });
      
      // Refresh item details to show the updated claim
      const updatedItem = await getItemById(id);
      setItem(updatedItem);
      setClaimActionSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setClaimActionSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error approving claim:', err);
      setClaimActionError(err.message || 'Failed to approve claim. Please try again.');
    } finally {
      setProcessingClaimId(null);
    }
  };
  
  // Handle rejecting a claim
  const handleRejectClaim = async (claimId) => {
    if (!isAuthenticated || !isOwner) {
      return;
    }
    
    try {
      setProcessingClaimId(claimId);
      setClaimActionError(null);
      
      await respondToClaim(id, claimId, { 
        status: 'rejected',
        responseMessage: 'Your claim has been rejected by the item owner.'
      });
      
      // Refresh item details to show the updated claim
      const updatedItem = await getItemById(id);
      setItem(updatedItem);
      setClaimActionSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setClaimActionSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Error rejecting claim:', err);
      setClaimActionError(err.message || 'Failed to reject claim. Please try again.');
    } finally {
      setProcessingClaimId(null);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async () => {
    if (!isAuthenticated || !isOwner) {
      return;
    }
    
    try {
      setDeleting(true);
      
      await deleteItem(id);
      
      // Navigate back to dashboard after successful deletion
      navigate('/dashboard', { 
        state: { message: 'Item deleted successfully', type: 'success' } 
      });
      
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message || 'Failed to delete item. Please try again.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image too large. Maximum size is 5MB.');
      return;
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
      return;
    }
    
    setImageFile(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isOwner) {
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      // Create form data for submission
      const itemData = {
        ...editFormData
      };
      
      // Add image file if selected
      if (imageFile) {
        itemData.image = imageFile;
      }
      
      // Update the item
      const updatedItem = await updateItem(id, itemData);
      
      // Update the local state
      setItem(updatedItem);
      setIsEditMode(false);
      setUpdateSuccess(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message || 'Failed to update item. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isEditMode) {
      // Initialize form data with current item values
      setEditFormData({
        name: item.name || '',
        description: item.description || '',
        location: item.location || '',
        category: item.category || '',
        status: item.status || ''
      });
      setImagePreview(item.image || '');
    }
    
    setIsEditMode(!isEditMode);
  };

  // Fetch item details
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const itemDetails = await getItemById(id);
        setItem(itemDetails);
        setError(null);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError(err.message || 'Failed to load item details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  // Check if the current user is the owner of this item
  const isOwner = currentUser && item?.user && currentUser._id === item.user._id;
  
  // Check if the current user has already claimed this item
  const hasUserClaimed = currentUser && item?.claims?.some(
    claim => claim.user === currentUser._id
  );

  // Handle claim submission
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/item/${id}` } });
      return;
    }
    
    if (!claimMessage.trim()) {
      setError('Please provide a message explaining your claim.');
      return;
    }
    
    try {
      setSubmittingClaim(true);
      setError(null);
      
      await claimItem(id, { message: claimMessage });
      
      setClaimSuccess(true);
      setShowClaimForm(false);
      // Refresh item details to show the new claim
      const updatedItem = await getItemById(id);
      setItem(updatedItem);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError(err.message || 'Failed to submit your claim. Please try again.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Get badge color based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'lost':
        return 'bg-amber-100 text-amber-800';
      case 'found':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'lost':
        return <LostIcon />;
      case 'found':
        return <FoundIcon />;
      case 'claimed':
        return <ClaimedIcon />;
      default:
        return null;
    }
  };

  // Date formatter
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
        <Link to="/" className="text-brand-blue hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Item not found</p>
            </div>
          </div>
        </div>
        <Link to="/" className="text-brand-blue hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-brand-blue hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Update success message */}
      {updateSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Item updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Item details card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Item actions for owner */}
        {isOwner && !isEditMode && (
          <div className="bg-gray-50 p-4 flex justify-end space-x-2">
            <button
              onClick={toggleEditMode}
              className="flex items-center text-sm text-brand-blue hover:text-blue-700"
            >
              <EditIcon />
              <span className="ml-1">Edit Item</span>
            </button>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <DeleteIcon />
                <span className="ml-1">Delete</span>
              </button>
            ) : (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Confirm delete?</span>
                <button
                  onClick={handleDeleteItem}
                  disabled={deleting}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded mr-1"
                >
                  {deleting ? 'Deleting...' : 'Yes'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}

        {isEditMode ? (
          /* Edit Form */
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Edit Item</h1>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={editFormData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                  >
                    <option value="">Select a category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Documents">Documents</option>
                    <option value="Pets">Pets</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={editFormData.location}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Where was the item lost/found?"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="">Select status</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={editFormData.description}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Provide a detailed description of the item..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Item Image</label>
                <div className="mt-1 flex items-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Item preview" 
                        className="h-32 w-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md w-full">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-blue hover:text-blue-500 focus-within:outline-none">
                            <span>Upload an image</span>
                            <input id="image-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
                >
                  {updating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* View Item Details */
          <div>
            {/* Item header with status */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">{item.name}</h1>
                <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${getStatusBadgeClass(item.status)}`}>
                  {getStatusIcon(item.status)}
                  <span className="ml-1 capitalize">{item.status}</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Posted by {item.user?.username || 'Anonymous'} on {formatDate(item.createdAt)}</p>
            </div>

            {/* Item details */}
            <div className="flex flex-col md:flex-row">
              {/* Item image */}
              <div className="md:w-1/2 p-6">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={item.image || `https://source.unsplash.com/random/800x600?${item.category}`} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Item info */}
              <div className="md:w-1/2 p-6">
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 mt-1"><CategoryIcon /></span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="text-gray-800">{item.category}</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="flex-shrink-0 mt-1"><LocationIcon /></span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-800">{item.location}</p>
                    </div>
                  </li>
                  
                  <li className="flex items-start">
                    <span className="flex-shrink-0 mt-1"><DateIcon /></span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-gray-800">{formatDate(item.createdAt)}</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-800">{item.description}</p>
                </div>

                {/* Claim button - only show if user is not the owner and item is not claimed */}
                {!isOwner && item.status !== 'claimed' && (
                  <div className="mt-8">
                    {/* Claim Success Message */}
                    {claimSuccess && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">
                              Your claim has been submitted successfully! The owner will review your request.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Already Claimed Message */}
                    {hasUserClaimed && !claimSuccess && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              You have already claimed this item. Please check your dashboard for updates.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Claim Form */}
                    {!hasUserClaimed && !claimSuccess && (
                      <>
                        {showClaimForm ? (
                          <form onSubmit={handleSubmitClaim} className="space-y-4">
                            <div>
                              <label htmlFor="claimMessage" className="block text-sm font-medium text-gray-700 mb-1">
                                Why are you claiming this item? *
                              </label>
                              <textarea
                                id="claimMessage"
                                name="claimMessage"
                                rows={4}
                                value={claimMessage}
                                onChange={(e) => setClaimMessage(e.target.value)}
                                placeholder="Please provide details about why this item belongs to you..."
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue"
                                required
                              />
                              <p className="mt-1 text-sm text-gray-500">
                                Your message will be sent to the item owner.
                              </p>
                            </div>

                            {error && (
                              <div className="text-sm text-red-600">
                                {error}
                              </div>
                            )}

                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                disabled={submittingClaim}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
                              >
                                {submittingClaim ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                  </>
                                ) : (
                                  'Submit Claim'
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowClaimForm(false)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => isAuthenticated ? setShowClaimForm(true) : navigate('/login', { state: { from: `/item/${id}` }})}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Claim This Item
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Owner view - show claims */}
                {isOwner && item.claims && item.claims.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Claim Requests</h3>
                    
                    {/* Claim Action Success Message */}
                    {claimActionSuccess && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">
                              Claim status updated successfully!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Claim Action Error Message */}
                    {claimActionError && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{claimActionError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {item.claims.map((claim) => (
                        <div key={claim._id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{claim.user?.username || 'Anonymous'}</p>
                              <p className="text-sm text-gray-500">{formatDate(claim.createdAt)}</p>
                              <p className="mt-2">{claim.message}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {claim.status}
                            </span>
                          </div>
                          
                          {claim.status === 'pending' && (
                            <div className="mt-4 flex space-x-2">
                              <button
                                onClick={() => handleApproveClaim(claim._id)}
                                disabled={processingClaimId === claim._id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500 disabled:opacity-50"
                              >
                                {processingClaimId === claim._id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleRejectClaim(claim._id)}
                                disabled={processingClaimId === claim._id}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50"
                              >
                                {processingClaimId === claim._id ? 'Processing...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;