import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuth = () => {
  const { 
    user, 
    userRole, 
    isAuthenticated, 
    isLoading,
    customerLogin,
    logout 
  } = useAuth();

  const handleTestLogin = async () => {
    try {
      await customerLogin({
        username: 'customer_test',
        password: 'TestPass123!'
      });
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout successful!');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Authentication Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current State:</h3>
        <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User Role:</strong> {userRole || 'None'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
      </div>

      <div>
        <button 
          onClick={handleTestLogin}
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Customer Login
        </button>
        
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default TestAuth;