// Base API URL - Change this to your actual backend URL in production
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Handles API requests with proper error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} - Response data or error
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Make the fetch request
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Parse the JSON response
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw { 
        status: response.status, 
        message: data.message || 'Something went wrong',
        data
      };
    }
    
    return data;
  } catch (error) {
    // Handle network errors and JSON parsing errors
    if (!error.status) {
      throw { message: 'Network error or server unavailable. Please check if the backend server is running.' };
    }
    throw error;
  }
}

// Auth Services
export const authService = {
  // Login user
  login: (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  // Register user
  register: (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // Get current user
  getCurrentUser: () => {
    return apiRequest('/auth/me');
  }
};

// User Services
export const userService = {
  // Get user profile
  getProfile: () => {
    return apiRequest('/user/profile');
  },
  
  // Update user name
  updateName: (name) => {
    return apiRequest('/user/name', {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
  }
};

export default apiRequest;