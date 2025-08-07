import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem('cashier_token');
    const savedUser = localStorage.getItem('cashier_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password, role = 'cashier', cashierKey = '') => {
    try {
      const endpoint = role === 'cashier' ? 'cashier' : role === 'manager' ? 'manager' : 'customer';
      const requestBody = { username, password };
      
      // Add cashier key for cashier login
      if (role === 'cashier' && cashierKey) {
        requestBody.cashier_key = cashierKey;
      }

      const response = await fetch(`${API_BASE_URL}/auth/${endpoint}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('cashier_token', data.token);
        localStorage.setItem('cashier_user', JSON.stringify({
          id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role
        }));

        setToken(data.token);
        setUser({
          id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role
        });

        return { success: true, user: data };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem('cashier_token');
      localStorage.removeItem('cashier_user');
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return !!(token && user);
  };

  const isCashier = () => {
    return user && user.role === 'cashier';
  };

  const isManager = () => {
    return user && user.role === 'manager';
  };

  const isCustomer = () => {
    return user && user.role === 'customer';
  };

  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Token ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    isCashier,
    isManager,
    isCustomer,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;