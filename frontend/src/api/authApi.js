/**
 * Authentication API service
 * Handles communication with the backend for user authentication
 */

// Base API URL - should match backend server
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.username - User's username
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {File} [userData.avatar] - User's profile picture (optional)
 * @returns {Promise<Object>} - Response data with token and user info
 */
export const register = async (userData) => {
  try {
    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Create FormData to handle file uploads
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    
    // Append avatar file if provided
    if (userData.avatar) {
      formData.append('avatar', userData.avatar);
    }
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      // No Content-Type header needed; browser sets it with boundary for FormData
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }
    
    // Check response type to avoid JSON parsing errors with HTML responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like HTML error pages)
      await response.text(); // Read but don't store to avoid linting errors
      throw new Error('Unexpected server response format');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save token and user data to local storage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
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
 * Login a user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} - Response data with token and user info
 */
export const login = async (credentials) => {
  try {
    // Add timeout to prevent hanging promises
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check for network-level errors first
    if (!response) {
      throw new Error('Network response was not received');
    }
    
    // Check response type to avoid JSON parsing errors with HTML responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like HTML error pages)
      await response.text(); // Read but don't store to avoid linting errors
      throw new Error('Unexpected server response format');
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save token and user data to local storage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
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
 * Logout a user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get the current user from local storage
 * @returns {Object|null} - User data or null if not logged in
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get the auth token from local storage
 * @returns {string|null} - Auth token or null if not present
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Helper to get auth header with Bearer token
 * @returns {Object} - Headers object with Authorization
 */
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};