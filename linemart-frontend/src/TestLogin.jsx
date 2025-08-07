import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TestLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testAccounts = [
    {
      username: 'manager1',
      email: 'manager@linemart.com',
      role: 'manager',
      password: 'password123',
      dashboard: '/manager'
    },
    {
      username: 'cashier1', 
      email: 'cashier@linemart.com',
      role: 'cashier',
      password: 'password123',
      dashboard: '/cashier'
    }
  ];

  const handleTestLogin = async (account) => {
    setLoading(true);
    setMessage('');
    
    try {
      // Mock login - in a real app this would call the API
      const mockUser = {
        id: 1,
        username: account.username,
        email: account.email,
        role: account.role,
        first_name: account.role === 'manager' ? 'Manager' : 'Cashier',
        last_name: 'User'
      };
      
      // Store in localStorage for the auth context
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-token-' + account.role);
      
      setMessage(`✅ Logged in as ${account.role}! Redirecting...`);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(account.dashboard);
      }, 1000);
      
    } catch (error) {
      setMessage(`❌ Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      width: '100%'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '1rem',
      color: '#FF6B35'
    },
    subtitle: {
      textAlign: 'center',
      color: '#666',
      marginBottom: '2rem'
    },
    accountCard: {
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    accountCardHover: {
      borderColor: '#FF6B35',
      backgroundColor: '#fff8f5'
    },
    accountTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '0.5rem'
    },
    accountDetails: {
      color: '#666',
      fontSize: '0.9rem',
      marginBottom: '1rem'
    },
    button: {
      backgroundColor: '#FF6B35',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
      transition: 'background-color 0.2s ease'
    },
    buttonHover: {
      backgroundColor: '#E55A2B'
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    message: {
      textAlign: 'center',
      padding: '1rem',
      borderRadius: '6px',
      marginTop: '1rem',
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    testRoutes: {
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      fontSize: '0.9rem'
    },
    routeLink: {
      color: '#FF6B35',
      textDecoration: 'none',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧪 LineMart Test Login</h1>
        <p style={styles.subtitle}>
          Choose a test account to access the dashboards
        </p>

        {testAccounts.map((account, index) => (
          <div
            key={index}
            style={styles.accountCard}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#FF6B35';
              e.target.style.backgroundColor = '#fff8f5';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.backgroundColor = 'white';
            }}
          >
            <div style={styles.accountTitle}>
              {account.role === 'manager' ? '👨‍💼' : '🛒'} {account.role.toUpperCase()} ACCOUNT
            </div>
            <div style={styles.accountDetails}>
              <strong>Username:</strong> {account.username}<br/>
              <strong>Email:</strong> {account.email}<br/>
              <strong>Dashboard:</strong> {account.dashboard}
            </div>
            <button
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              onClick={() => handleTestLogin(account)}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#E55A2B';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#FF6B35';
              }}
            >
              {loading ? 'Logging in...' : `Login as ${account.role}`}
            </button>
          </div>
        ))}

        {message && (
          <div style={{
            ...styles.message,
            ...(message.includes('❌') ? styles.errorMessage : {})
          }}>
            {message}
          </div>
        )}

        <div style={styles.testRoutes}>
          <strong>🔗 Direct Test Routes (No Auth Required):</strong><br/>
          <a href="/test-manager" style={styles.routeLink}>Manager Dashboard</a> | {' '}
          <a href="/test-cashier" style={styles.routeLink}>Cashier Dashboard</a> | {' '}
          <a href="/test-customer" style={styles.routeLink}>Customer Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default TestLogin;