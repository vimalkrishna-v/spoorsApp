import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

// Custom hook to use Auth Context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample credentials for testing (in real app, this would come from backend)
  const sampleUsers = [
    { id: 1, email: 'admin@spoorsapp.com', password: 'admin123', role: 'admin', name: 'Admin User' },
    { id: 2, email: 'bd@spoorsapp.com', password: 'bd1234', role: 'bd', name: 'BD Executive' },
  ];

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const user = localStorage.getItem('spoorsUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    // In a real app, this would be an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = sampleUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          // Remove password from the user object for security
          const { password, ...secureUser } = user;
          setCurrentUser(secureUser);
          localStorage.setItem('spoorsUser', JSON.stringify(secureUser));
          resolve(secureUser);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500); // Simulate API delay
    });
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('spoorsUser');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
