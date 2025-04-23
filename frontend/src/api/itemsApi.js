/**
 * Items API service
 * Handles communication with the backend for item operations
 */
import { getToken, authHeader } from './authApi';

// Base API URL - should match backend server
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Get all items
 * @returns {Promise<Array>} List of all items
 */
export const getAllItems = async () => {
  try {
    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch items');
    }

    return data.data; // Access the items array from the response
  } catch (error) {
    console.error('Error fetching items:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Get a single item by ID with detailed information
 * @param {string} id - Item ID to fetch
 * @returns {Promise<Object>} Item details with claims
 */
export const getItemById = async (id) => {
  try {
    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items/${id}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }
    
    const data = await response.json();

    if (!response.ok) {
      // Pass the specific error message from the backend
      throw new Error(data.message || 'Failed to fetch item details');
    }

    return data.data; // Access the item from the response
  } catch (error) {
    console.error('Error fetching item details:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Get lost items only
 * @returns {Promise<Array>} List of lost items
 */
export const getLostItems = async () => {
  try {
    const items = await getAllItems();
    return items.filter(item => item.status === 'lost');
  } catch (error) {
    console.error('Error fetching lost items:', error);
    throw error;
  }
};

/**
 * Get found items only
 * @returns {Promise<Array>} List of found items
 */
export const getFoundItems = async () => {
  try {
    const items = await getAllItems();
    return items.filter(item => item.status === 'found');
  } catch (error) {
    console.error('Error fetching found items:', error);
    throw error;
  }
};

/**
 * Get user's items
 * @param {string} userId - User ID to filter by
 * @returns {Promise<Array>} List of user's items
 */
export const getUserItems = async (userId) => {
  try {
    const items = await getAllItems();
    return items.filter(item => item.user._id === userId);
  } catch (error) {
    console.error('Error fetching user items:', error);
    throw error;
  }
};

/**
 * Create a new item
 * @param {Object} itemData - Item data to create
 * @param {string} itemData.name - Item name
 * @param {string} itemData.description - Item description
 * @param {string} itemData.location - Location where item was lost/found
 * @param {string} itemData.status - Item status (lost/found)
 * @param {string} itemData.category - Item category
 * @param {File} [itemData.image] - Item image (optional)
 * @returns {Promise<Object>} Created item
 */
export const createItem = async (itemData) => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for uploads
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append text fields
    Object.keys(itemData).forEach(key => {
      // Only append if not the image file (handled separately)
      if (key !== 'image' || typeof itemData[key] !== 'object') {
        formData.append(key, itemData[key]);
      }
    });
    
    // Append image file if provided
    if (itemData.image instanceof File) {
      formData.append('image', itemData.image);
    }
    
    const response = await fetch(`${API_URL}/items/create`, {
      method: 'POST',
      headers: {
        // No Content-Type header for FormData; browser sets it with boundary
        ...authHeader()
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create item');
    }

    return data.data;
  } catch (error) {
    console.error('Error creating item:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Update an item
 * @param {string} id - Item ID to update
 * @param {Object} itemData - Updated item data
 * @returns {Promise<Object>} Updated item
 */
export const updateItem = async (id, itemData) => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for uploads
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append text fields
    Object.keys(itemData).forEach(key => {
      // Only append if not the image file (handled separately)
      if (key !== 'image' || typeof itemData[key] !== 'object') {
        formData.append(key, itemData[key]);
      }
    });
    
    // Append image file if provided
    if (itemData.image instanceof File) {
      formData.append('image', itemData.image);
    }
    
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'PUT',
      headers: {
        // No Content-Type header for FormData; browser sets it with boundary
        ...authHeader()
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update item');
    }

    return data.data;
  } catch (error) {
    console.error('Error updating item:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Delete an item
 * @param {string} id - Item ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteItem = async (id) => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: 'DELETE',
      headers: {
        ...authHeader()
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete item');
    }

    return data;
  } catch (error) {
    console.error('Error deleting item:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Search items by query
 * @param {Object} query - Search parameters
 * @param {string} query.term - Search term
 * @param {string} query.category - Category filter
 * @param {string} query.status - Status filter (lost or found)
 * @returns {Promise<Array>} Filtered items
 */
export const searchItems = async ({ term, category, status }) => {
  try {
    const items = await getAllItems();
    
    return items.filter(item => {
      // Apply status filter if provided
      if (status && item.status !== status) {
        return false;
      }
      
      // Apply category filter if provided
      if (category && item.category !== category) {
        return false;
      }
      
      // Apply search term if provided
      if (term) {
        const searchTerm = term.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.location.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error searching items:', error);
    throw error;
  }
};

/**
 * Submit a claim for an item
 * @param {string} itemId - ID of the item to claim
 * @param {Object} claimData - Claim data
 * @param {string} claimData.message - Message explaining the claim
 * @returns {Promise<Object>} Updated item with the new claim
 */
export const claimItem = async (itemId, claimData) => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items/${itemId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      },
      body: JSON.stringify(claimData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit claim');
    }

    return data.data;
  } catch (error) {
    console.error('Error claiming item:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Get claims for an item (for item owners)
 * @param {string} itemId - ID of the item
 * @returns {Promise<Array>} List of claims for the item
 */
export const getItemClaims = async (itemId) => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items/${itemId}/claims`, {
      headers: {
        ...authHeader()
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch claims');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching item claims:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Respond to a claim (approve or reject)
 * @param {string} itemId - ID of the item
 * @param {string} claimId - ID of the claim
 * @param {Object} responseData - Response data
 * @param {string} responseData.status - 'approved' or 'rejected'
 * @param {string} [responseData.responseMessage] - Optional message explaining the decision
 * @returns {Promise<Object>} Updated item with updated claim
 */
export const respondToClaim = async (itemId, claimId, responseData) => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items/${itemId}/claims/${claimId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      },
      body: JSON.stringify(responseData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to respond to claim');
    }

    return data.data;
  } catch (error) {
    console.error('Error responding to claim:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Get user's claims (claims made by the current user)
 * @returns {Promise<Array>} List of user's claims
 */
export const getUserClaims = async () => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items/user/claims`, {
      headers: {
        ...authHeader()
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user claims');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching user claims:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};

/**
 * Get user dashboard data
 * @returns {Promise<Object>} Dashboard data with posted, claimed, and pending items
 */
export const getUserDashboard = async () => {
  try {
    // Check if user is authenticated
    if (!getToken()) {
      throw new Error('Authentication required');
    }

    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/items/user/dashboard`, {
      headers: {
        ...authHeader()
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard data');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Convert network errors to more user-friendly messages
    if (error.name === 'TypeError') {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    } else if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    throw error;
  }
};