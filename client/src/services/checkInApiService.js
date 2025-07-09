import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://spoorsapp-hgxp.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spoorsToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('CheckIn API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (error.response?.status === 401) {
      // Token is invalid or expired, redirect to login
      localStorage.removeItem('spoorsToken');
      localStorage.removeItem('spoorsUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Check-in API calls
export const checkInApiService = {
  // Check if BD can check in to operator (validate location)
  canCheckIn: async (operatorId, location) => {
    const response = await api.post(`/checkins/can-check-in/${operatorId}`, location);
    return response.data;
  },

  // Check in to an operator
  checkIn: async (operatorId, checkInData) => {
    const response = await api.post(`/checkins/check-in/${operatorId}`, checkInData);
    return response.data;
  },

  // Update location during active check-in
  updateLocation: async (checkInId, location) => {
    const response = await api.put(`/checkins/update-location/${checkInId}`, location);
    return response.data;
  },

  // Check out from operator
  checkOut: async (checkInId, checkOutData) => {
    const response = await api.post(`/checkins/check-out/${checkInId}`, checkOutData);
    return response.data;
  },

  // Get active check-in for current BD user
  getActiveCheckIn: async () => {
    const response = await api.get('/checkins/active');
    return response.data;
  },

  // Get check-in history for current BD user
  getCheckInHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/checkins/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get detailed check-in information
  getCheckInDetails: async (checkInId) => {
    const response = await api.get(`/checkins/details/${checkInId}`);
    return response.data;
  }
};

// Geolocation utility functions
export const locationUtils = {
  // Get current position with high accuracy
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // 30 seconds cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Unknown location error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
            default:
              message = 'Unknown location error';
              break;
          }
          reject(new Error(message));
        },
        options
      );
    });
  },

  // Watch position changes
  watchPosition: (callback, errorCallback) => {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let message = 'Unknown location error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
          default:
            message = 'Unknown location error';
            break;
        }
        errorCallback(new Error(message));
      },
      options
    );
  },

  // Stop watching position
  clearWatch: (watchId) => {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId);
    }
  },

  // Calculate distance between two coordinates (client-side validation)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
};

export default checkInApiService;
