import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles = ['cashier', 'manager'] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #FF6B3520',
            borderTop: '4px solid #FF6B35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#7F8C8D', fontSize: '1rem' }}>Loading...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAuth && isAuthenticated() && user && !allowedRoles.includes(user.role)) {
    // User is authenticated but doesn't have the right role
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#F8F9FA'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#E74C3C', marginBottom: '1rem' }}>Access Denied</h2>
          <p style={{ color: '#7F8C8D', marginBottom: '1.5rem' }}>
            You don't have permission to access this area. This is restricted to {allowedRoles.join(' and ')} accounts only.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: '#FF6B35',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!requireAuth && isAuthenticated()) {
    // If user is already authenticated and trying to access login, redirect to appropriate dashboard
    const redirectPath = user?.role === 'manager' ? '/manager-dashboard' : '/cashier-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;