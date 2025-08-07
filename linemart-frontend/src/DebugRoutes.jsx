import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DebugRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routes = [
    { path: '/manager-dashboard', name: 'Manager Dashboard (No Auth)', status: 'Should work' },
    { path: '/cashier-dashboard', name: 'Cashier Dashboard (No Auth)', status: 'Should work' },
    { path: '/customer-dashboard', name: 'Customer Dashboard (No Auth)', status: 'Should work' },
    { path: '/manager', name: 'Manager (Auth Required)', status: 'Requires login' },
    { path: '/cashier', name: 'Cashier (Auth Required)', status: 'Requires login' },
    { path: '/customer', name: 'Customer (Auth Required)', status: 'Requires login' },
    { path: '/test-manager', name: 'Test Manager', status: 'Should work' },
    { path: '/test-cashier', name: 'Test Cashier', status: 'Should work' },
    { path: '/test-customer', name: 'Test Customer', status: 'Should work' },
    { path: '/test-login', name: 'Test Login Page', status: 'Should work' },
  ];

  const styles = {
    container: {
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#FF6B35'
    },
    currentPath: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '2rem',
      border: '1px solid #e0e0e0'
    },
    routeList: {
      display: 'grid',
      gap: '1rem'
    },
    routeCard: {
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s ease'
    },
    routeCardHover: {
      borderColor: '#FF6B35',
      backgroundColor: '#fff8f5'
    },
    routeName: {
      fontWeight: '600',
      color: '#333'
    },
    routePath: {
      color: '#666',
      fontSize: '0.9rem',
      fontFamily: 'monospace'
    },
    routeStatus: {
      fontSize: '0.8rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontWeight: '500'
    },
    statusWorking: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    statusAuth: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    button: {
      backgroundColor: '#FF6B35',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    backButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginBottom: '2rem'
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.backButton}
        onClick={() => navigate(-1)}
      >
        ← Go Back
      </button>
      
      <h1 style={styles.title}>🔍 Route Debug Page</h1>
      
      <div style={styles.currentPath}>
        <strong>Current Location:</strong> {location.pathname}
        <br />
        <strong>Search:</strong> {location.search || 'None'}
        <br />
        <strong>Hash:</strong> {location.hash || 'None'}
      </div>

      <h2>Available Routes:</h2>
      <div style={styles.routeList}>
        {routes.map((route, index) => (
          <div
            key={index}
            style={styles.routeCard}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#FF6B35';
              e.target.style.backgroundColor = '#fff8f5';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.backgroundColor = 'white';
            }}
          >
            <div>
              <div style={styles.routeName}>{route.name}</div>
              <div style={styles.routePath}>{route.path}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span 
                style={{
                  ...styles.routeStatus,
                  ...(route.status.includes('Should work') ? styles.statusWorking : styles.statusAuth)
                }}
              >
                {route.status}
              </span>
              <button
                style={styles.button}
                onClick={() => handleNavigate(route.path)}
              >
                Go →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🛠️ Troubleshooting Tips:</h3>
        <ul>
          <li><strong>If routes don't work:</strong> Make sure both backend (port 8000) and frontend (port 3001) are running</li>
          <li><strong>If you see blank pages:</strong> Check browser console for JavaScript errors</li>
          <li><strong>If authentication fails:</strong> Use the test routes (test-manager, test-cashier, test-customer)</li>
          <li><strong>If APIs fail:</strong> Verify backend is accessible at http://localhost:8000/api/</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugRoutes;