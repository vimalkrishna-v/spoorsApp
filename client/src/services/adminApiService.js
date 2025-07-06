import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spoorsToken');
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
  });
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.status === 401) {
      // Token is invalid or expired, redirect to login
      console.warn('Unauthorized access - clearing tokens and redirecting to login');
      localStorage.removeItem('spoorsToken');
      localStorage.removeItem('spoorsUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User management API calls
export const userApiService = {
  // Get all BD users
  getAllBDUsers: async () => {
    const response = await api.get('/users/bd-users');
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  },

  // Create new BD user
  createBDUser: async (userData) => {
    const response = await api.post('/users/bd-users', userData);
    return response.data;
  },

  // Update BD user
  updateBDUser: async (userId, userData) => {
    const response = await api.put(`/users/bd-users/${userId}`, userData);
    return response.data;
  },

  // Delete BD user
  deleteBDUser: async (userId) => {
    const response = await api.delete(`/users/bd-users/${userId}`);
    return response.data;
  },

  // Assign operators to BD user
  assignOperatorsToBD: async (bdUserId, operatorIds) => {
    const response = await api.post('/users/assign-operators', {
      bdUserId,
      operatorIds
    });
    return response.data;
  },

  // Get operators assigned to BD user
  getBDUserOperators: async (userId) => {
    const response = await api.get(`/users/bd-users/${userId}/operators`);
    return response.data;
  }
};

// Operator management API calls (admin)
export const adminOperatorApiService = {
  // Get all operators
  getAllOperators: async () => {
    const response = await api.get('/operators/admin/all');
    return response.data;
  },

  // Create new operator
  createOperator: async (operatorData) => {
    const response = await api.post('/operators/admin/create', operatorData);
    return response.data;
  },

  // Update operator
  updateOperator: async (operatorId, operatorData) => {
    const response = await api.put(`/operators/admin/${operatorId}`, operatorData);
    return response.data;
  },

  // Delete operator
  deleteOperator: async (operatorId) => {
    const response = await api.delete(`/operators/admin/${operatorId}`);
    return response.data;
  }
};

// Admin Check-in management API calls
export const adminCheckInApiService = {
  // Get all check-ins with filtering
  getAllCheckIns: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/checkins/admin/all?${params.toString()}`);
    return response.data;
  },

  // Get check-in analytics
  getAnalytics: async (days = 30) => {
    const response = await api.get(`/checkins/admin/analytics?days=${days}`);
    return response.data;
  },

  // Get detailed check-in information (admin version)
  getCheckInDetails: async (checkInId) => {
    const response = await api.get(`/checkins/admin/details/${checkInId}`);
    return response.data;
  }
};

export default api;
