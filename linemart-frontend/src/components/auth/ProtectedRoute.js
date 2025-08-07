import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  allowWithoutLogin = false,
  redirectTo = null 
}) => {
  const { 
    isAuthenticated, 
    userRole, 
    hasPermission, 
    hasRole, 
    isLoading,
    canAccessWithoutLogin 
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Check if route allows access without login (customer only)
  if (allowWithoutLogin && canAccessWithoutLogin()) {
    return children;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Determine redirect based on the path or required role
    let loginPath = '/customer/login';
    
    if (requiredRole === 'CASHIER' || location.pathname.includes('/cashier/')) {
      loginPath = '/cashier/login';
    } else if (requiredRole === 'MANAGER' || location.pathname.includes('/manager/')) {
      loginPath = '/manager/login';
    }
    
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardPath = getDashboardPath(userRole);
    return <Navigate to={dashboardPath} replace />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this resource.</p>
          <p>Required permission: <strong>{requiredPermission}</strong></p>
          <button onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check path-based access control
  const currentPath = location.pathname;
  if (!checkPathAccess(currentPath, userRole)) {
    const dashboardPath = getDashboardPath(userRole);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Helper function to get dashboard path based on role
const getDashboardPath = (role) => {
  switch (role) {
    case 'CUSTOMER':
      return '/customer/dashboard';
    case 'CASHIER':
      return '/cashier/dashboard';
    case 'MANAGER':
      return '/manager/dashboard';
    default:
      return '/customer/dashboard';
  }
};

// Helper function to check path-based access control
const checkPathAccess = (path, userRole) => {
  // Access control rules as per specification
  if (path.startsWith('/api/customer/')) {
    // Customer endpoints - allow customers, restrict certain actions
    if (userRole === 'CUSTOMER') {
      // Restrict order viewing and payment for unauthenticated (handled above)
      return true;
    }
    return false;
  }
  
  if (path.startsWith('/cashier/') || path.startsWith('/api/cashier/')) {
    return userRole === 'CASHIER';
  }
  
  if (path.startsWith('/manager/') || path.startsWith('/api/manager/')) {
    return userRole === 'MANAGER';
  }
  
  if (path.startsWith('/api/common/')) {
    return ['CUSTOMER', 'CASHIER', 'MANAGER'].includes(userRole);
  }
  
  // Allow access to general routes
  return true;
};

// Specific route components for different roles
export const CustomerRoute = ({ children, allowWithoutLogin = false }) => (
  <ProtectedRoute 
    requiredRole="CUSTOMER" 
    allowWithoutLogin={allowWithoutLogin}
  >
    {children}
  </ProtectedRoute>
);

export const CashierRoute = ({ children }) => (
  <ProtectedRoute requiredRole="CASHIER">
    {children}
  </ProtectedRoute>
);

export const ManagerRoute = ({ children }) => (
  <ProtectedRoute requiredRole="MANAGER">
    {children}
  </ProtectedRoute>
);

// Permission-based route components
export const PermissionRoute = ({ children, permission }) => (
  <ProtectedRoute requiredPermission={permission}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;