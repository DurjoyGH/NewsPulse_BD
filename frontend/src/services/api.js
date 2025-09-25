// Base API URL - Change this to your actual backend URL in production
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Log API URL in development to help with debugging
if (import.meta.env.DEV) {
  console.log('API URL:', BASE_URL);
}

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
    
    // Don't set Content-Type for FormData requests
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }
    
    // Make the fetch request
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Parse the response
    let data;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Try to parse as JSON in case Content-Type header is wrong
        try {
          data = JSON.parse(text);
        } catch {
          // If it's not JSON, create a simple object with the text
          data = { message: text, rawResponse: true };
        }
      }
    } catch (err) {
      console.error("Error parsing response:", err);
      throw { 
        status: response.status, 
        message: 'Error parsing server response',
        originalError: err
      };
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
      console.error("API request error:", error);
      throw { 
        message: 'Network error or server unavailable. Please check if the backend server is running.',
        originalError: error
      };
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
  },

  // Upload profile image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}/user/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`);
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { 
          status: response.status, 
          message: data.message || 'Failed to upload image',
          data
        };
      }
      
      return data;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error.message ? error : { message: 'Failed to upload image. Please try again.' };
    }
  },

  // Delete profile image
  deleteImage: async () => {
    try {
      const response = await apiRequest('/user/delete-image', {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error("Delete image error:", error);
      throw error.message ? error : { message: 'Failed to delete image. Please try again.' };
    }
  }
};

// Article Services
export const articleService = {
  // Get all articles with pagination
  getArticles: (page = 1, limit = 10) => {
    return apiRequest(`/articles?page=${page}&limit=${limit}`);
  },
  
  // Get single article
  getArticle: (id) => {
    return apiRequest(`/articles/${id}`);
  },
  
  // Get article statistics
  getStatistics: () => {
    return apiRequest('/articles/statistics');
  }
};

// Summary Services
export const summaryService = {
  // Get all summaries with pagination
  getSummaries: (page = 1, limit = 10) => {
    return apiRequest(`/summary?page=${page}&limit=${limit}`);
  },
  
  // Get summary for specific article
  getArticleSummary: (articleId) => {
    return apiRequest(`/summary/article/${articleId}`);
  },
  
  // Get summary statistics
  getStatistics: () => {
    return apiRequest('/summary/statistics');
  },
  
  // Process all articles to summaries
  processAllArticles: () => {
    return apiRequest('/summary/process-all', {
      method: 'POST'
    });
  },
  
  // Summarize specific article
  summarizeArticle: (articleId) => {
    return apiRequest(`/summary/article/${articleId}`, {
      method: 'POST'
    });
  }
};

// Category Services
export const categoryService = {
  // Get all categories
  getAllCategories: () => {
    return apiRequest('/category/all');
  },
  
  // Get categories with summary counts
  getCategoriesWithCounts: () => {
    return apiRequest('/category/categories-with-counts');
  },
  
  // Get summaries by category
  getSummariesByCategory: (categoryId) => {
    return apiRequest(`/category/summaries/${categoryId}`);
  },
  
  // Get summaries grouped by categories
  getSummariesGroupedByCategory: () => {
    return apiRequest('/summary/grouped-by-category');
  },
  
  // Categorize all summaries
  categorizeSummaries: () => {
    return apiRequest('/category/categorize-summaries', {
      method: 'POST'
    });
  }
};

// News Services (for the news.json data)
export const newsService = {
  // Get news statistics from processing service
  getNewsStatistics: () => {
    return apiRequest('/articles/statistics');
  }
};

export default apiRequest;