// Backend API service for operators
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class OperatorApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get authentication token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Create request headers with authentication
  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Get all operators assigned to the current BD user
  async getAssignedOperators() {
    try {
      const response = await this.request('/operators');
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned operators:', error);
      throw error;
    }
  }

  // Get operator details by ID
  async getOperatorById(operatorId) {
    try {
      const response = await this.request(`/operators/${operatorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching operator details:', error);
      throw error;
    }
  }

  // Check in to an operator
  async checkIn(operatorId, location) {
    try {
      const response = await this.request(`/operators/${operatorId}/checkin`, {
        method: 'POST',
        body: JSON.stringify({ location })
      });
      return response;
    } catch (error) {
      console.error('Error during check-in:', error);
      throw error;
    }
  }

  // Check out from an operator
  async checkOut(operatorId, location = null, notes = '') {
    try {
      const response = await this.request(`/operators/${operatorId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ location, notes })
      });
      return response;
    } catch (error) {
      console.error('Error during check-out:', error);
      throw error;
    }
  }

  // Get check-in history for the current BD user
  async getCheckInHistory(page = 1, limit = 10) {
    try {
      const response = await this.request(`/operators/checkins/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching check-in history:', error);
      throw error;
    }
  }

  // Get current check-in status for all operators
  async getCheckInStatus() {
    try {
      const response = await this.request('/operators/checkins/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching check-in status:', error);
      throw error;
    }
  }

  // Update operator information (admin only)
  async updateOperator(operatorId, updates) {
    try {
      const response = await this.request(`/operators/${operatorId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return response.data;
    } catch (error) {
      console.error('Error updating operator:', error);
      throw error;
    }
  }

  // --- Admin CRUD Operations ---
  // Get all operators (admin)
  async getAllOperators() {
    return this.request('/operators');
  }

  // Add a new operator
  async addOperator(operator) {
    return this.request('/operators', {
      method: 'POST',
      body: JSON.stringify(operator)
    });
  }

  // Update an operator
  async updateOperator(id, operator) {
    return this.request(`/operators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(operator)
    });
  }

  // Delete an operator
  async deleteOperator(id) {
    return this.request(`/operators/${id}`, {
      method: 'DELETE'
    });
  }

  // --- BD Executives ---
  // Get all BD executives
  async getAllBdExecutives() {
    return this.request('/bd-executives');
  }

  // Add a new BD executive
  async addBdExecutive(executive) {
    return this.request('/bd-executives', {
      method: 'POST',
      body: JSON.stringify(executive)
    });
  }

  // Update a BD executive
  async updateBdExecutive(id, executive) {
    return this.request(`/bd-executives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(executive)
    });
  }

  // Delete a BD executive
  async deleteBdExecutive(id) {
    return this.request(`/bd-executives/${id}`, {
      method: 'DELETE'
    });
  }
}

// Create and export a singleton instance
const operatorApiService = new OperatorApiService();
export default operatorApiService;

// Export the class for testing purposes
export { OperatorApiService };
