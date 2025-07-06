// operatorApiService.js
const BASE_URL = 'http://localhost:5000/api/operators';

const getToken = () => {
  return localStorage.getItem('spoorsToken'); // Use the same key as AuthContext
};

const request = async (url, options = {}) => {
  const token = getToken();
  if (!token) throw new Error('Access token is required');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  const data = await response.json();
  // Always return an array for assignedOperators
  return data.data || data;
};

const operatorApiService = {
  getAssignedOperators: () => request(`${BASE_URL}`),
  checkIn: (operatorId, location) =>
    request(`${BASE_URL}/${operatorId}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ location })
    }),
  checkOut: (operatorId, location, notes) =>
    request(`${BASE_URL}/${operatorId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ location, notes })
    }),
  getCheckInStatus: () => request(`${BASE_URL}/checkins/status`)
};

export default operatorApiService;
