import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('user_role');
        const storedPermissions = localStorage.getItem('user_permissions');
        const accessToken = localStorage.getItem('access_token');

        if (storedUser && storedRole && accessToken) {
          setUser(JSON.parse(storedUser));
          setUserRole(storedRole);
          setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : []);
          setIsAuthenticated(true);

          // Verify token is still valid by checking permissions
          try {
            await authApi.checkPermissions();
          } catch (error) {
            console.error('Token validation failed:', error);
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Customer login
  const customerLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.customerLogin(credentials);
      
      if (response.user && response.tokens) {
        setUser(response.user);
        setUserRole(response.user.role);
        setUserPermissions(response.user.permissions || []);
        setIsAuthenticated(true);
        return response;
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Customer login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Customer registration
  const customerRegister = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authApi.customerRegister(userData);
      
      if (response.user && response.tokens) {
        setUser(response.user);
        setUserRole(response.user.role);
        setUserPermissions(response.user.permissions || []);
        setIsAuthenticated(true);
        return response;
      }
      
      throw new Error('Invalid registration response');
    } catch (error) {
      console.error('Customer registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cashier login
  const cashierLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.cashierLogin(credentials);
      
      if (response.user && response.tokens) {
        setUser(response.user);
        setUserRole(response.user.role);
        setUserPermissions(response.user.permissions || []);
        setIsAuthenticated(true);
        return response;
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Cashier login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Manager login
  const managerLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.managerLogin(credentials);
      
      if (response.user && response.tokens) {
        setUser(response.user);
        setUserRole(response.user.role);
        setUserPermissions(response.user.permissions || []);
        setIsAuthenticated(true);
        return response;
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      console.error('Manager login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserRole(null);
      setUserPermissions([]);
      setIsAuthenticated(false);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // Get user interface position based on role
  const getInterfacePosition = () => {
    switch (userRole) {
      case 'CUSTOMER':
        return 'left';
      case 'CASHIER':
        return 'center';
      case 'MANAGER':
        return 'right';
      default:
        return 'left';
    }
  };

  // Get accessible dashboard based on role
  const getAccessibleDashboard = () => {
    switch (userRole) {
      case 'CUSTOMER':
        return 'CustomerDashboard';
      case 'CASHIER':
        return 'CashierDashboard';
      case 'MANAGER':
        return 'ManagerDashboard';
      default:
        return 'CustomerDashboard';
    }
  };

  // Check if user can access without login (customer only)
  const canAccessWithoutLogin = () => {
    return !isAuthenticated && (userRole === 'CUSTOMER' || userRole === null);
  };

  // Password reset functionality
  const requestPasswordReset = async (email) => {
    try {
      const response = await authApi.requestPasswordReset(email);
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await authApi.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const verifyResetToken = async (token) => {
    try {
      const response = await authApi.verifyResetToken(token);
      return response;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  };

  const value = {
    // State
    user,
    userRole,
    userPermissions,
    isAuthenticated,
    isLoading,

    // Actions
    customerLogin,
    customerRegister,
    cashierLogin,
    managerLogin,
    logout,

    // Password reset
    requestPasswordReset,
    resetPassword,
    verifyResetToken,

    // Utilities
    hasPermission,
    hasRole,
    getInterfacePosition,
    getAccessibleDashboard,
    canAccessWithoutLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;