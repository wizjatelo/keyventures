import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protected route that requires authentication
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isLoading, isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = userRole === 'CASHIER' ? '/cashier-dashboard' : '/customer-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Route that requires cashier authentication
export const CashierRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="CASHIER">
      {children}
    </ProtectedRoute>
  );
};

// Route for customers (can be accessed without login for browsing, but login required for certain actions)
export const CustomerRoute = ({ children, requireAuth = false }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};