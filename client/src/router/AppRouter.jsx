import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Auth/Login';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import BdDashboard from '../pages/BD/BdDashboard';
import MyOperators from '../pages/BD/MyOperators';
import BusOperators from '../pages/Admin/BusOperators';
import BdExecutives from '../pages/Admin/BdExecutives';


// Protected Route component to handle authentication checks
const ProtectedRoute = ({ element, requiredRole }) => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  let userRole = currentUser.role?.toLowerCase();
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard if authenticated but wrong role
    const dashboardPath = userRole === 'admin' ? '/admin/dashboard' : '/bd/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  // Render the protected component if all checks pass
  return element;
};

const AppRouter = () => {
  const { isAuthenticated, currentUser } = useAuth();

  // Helper function to redirect to appropriate dashboard if logged in
  const RedirectToDashboard = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;

    const role = currentUser.role?.toLowerCase();
    return role === 'admin'
      ? <Navigate to="/admin/dashboard" />
      : <Navigate to="/bd/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <RedirectToDashboard /> : <Login />
        } />

        {/* Protected routes */}
        <Route
          path="/admin/dashboard"
          element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />}
        />
        <Route
          path="/admin/bus-operators"
          element={<ProtectedRoute element={<BusOperators />} requiredRole="admin" />}
        />
        <Route
          path="/admin/bd-executives"
          element={<ProtectedRoute element={<BdExecutives />} requiredRole="admin" />}
        />
        <Route
          path="/bd/dashboard"
          element={<ProtectedRoute element={<BdDashboard />} requiredRole="bd" />}
        />

        <Route
          path="/bd/operators"
          element={<ProtectedRoute element={<MyOperators />} requiredRole="bd" />}
        />

        {/* Default route */}
        <Route path="/" element={<RedirectToDashboard />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
