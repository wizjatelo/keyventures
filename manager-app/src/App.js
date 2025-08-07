import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  Bell, Settings, Menu, X, Store, Users, Package,
  TrendingUp, DollarSign, AlertTriangle, CheckCircle,
  Eye, FileText, Download, ShoppingCart, Star, Activity, RefreshCw, LogOut, User
} from 'lucide-react';
import './App.css';

const ManagerApp = () => {
  // Authentication state - Manager only
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStore, setSelectedStore] = useState('all');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeStores: 0,
    totalCustomers: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    salesGrowth: 0,
    ordersGrowth: 0
  });

  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [storePerformance, setStorePerformance] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stores, setStores] = useState([]);

  // Theme
  const theme = {
    colors: {
      primary: '#FF6B35',
      primaryLight: '#FF8A5B',
      primaryDark: '#E55A2B',
      background: '#f8f9fa',
      cardBg: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      success: '#27AE60',
      error: '#E74C3C',
      warning: '#F39C12',
      info: '#3498DB'
    }
  };

  // Check authentication on load
  useEffect(() => {
    const token = localStorage.getItem('manager_token');
    const userData = localStorage.getItem('manager_user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        setShowLogin(false);
      } catch (err) {
        localStorage.removeItem('manager_token');
        localStorage.removeItem('manager_user');
      }
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      // Set up real-time polling every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Manager authentication
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/manager/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        // For demo purposes, allow test login
        if (credentials.username === 'manager1' && credentials.password === 'password123') {
          const mockUser = {
            id: 1,
            username: 'manager1',
            email: 'manager@linemart.com',
            role: 'manager',
            first_name: 'Manager',
            last_name: 'User'
          };
          setUser(mockUser);
          setIsAuthenticated(true);
          setShowLogin(false);
          localStorage.setItem('manager_token', 'mock-manager-token');
          localStorage.setItem('manager_user', JSON.stringify(mockUser));
          setSuccess('Login successful!');
          return;
        }
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      setShowLogin(false);
      localStorage.setItem('manager_token', data.token);
      localStorage.setItem('manager_user', JSON.stringify(data.user));
      setSuccess('Login successful!');
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setShowLogin(true);
    localStorage.removeItem('manager_token');
    localStorage.removeItem('manager_user');
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard metrics
      const metricsResponse = await fetch('http://localhost:8000/api/manager/manager-dashboard/dashboard_metrics/');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setDashboardData(metricsData);
      }

      // Fetch inventory alerts
      const alertsResponse = await fetch('http://localhost:8000/api/manager/manager-dashboard/inventory_alerts/');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setInventoryAlerts(alertsData.alerts || []);
      }

      // Fetch notifications
      const notificationsResponse = await fetch('http://localhost:8000/api/manager/manager-dashboard/notifications/');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);
      }

      // Fetch sales data
      const salesResponse = await fetch('http://localhost:8000/api/manager/manager-dashboard/sales_data/');
      if (salesResponse.ok) {
        const salesData = await salesResponse.json();
        setSalesData(salesData.sales_data || []);
      }

      // Fetch store performance
      const storeResponse = await fetch('http://localhost:8000/api/manager/manager-dashboard/store_performance/');
      if (storeResponse.ok) {
        const storeData = await storeResponse.json();
        setStorePerformance(storeData.store_performance || []);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    sidebar: {
      width: sidebarOpen ? '250px' : '80px',
      backgroundColor: theme.colors.cardBg,
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      zIndex: 20
    },
    sidebarHeader: {
      padding: '1rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    logo: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: theme.colors.primary
    },
    sidebarNav: {
      flex: 1,
      padding: '1rem 0'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      gap: '0.75rem'
    },
    navItemActive: {
      backgroundColor: theme.colors.primary,
      color: 'white'
    },
    mainContent: {
      flex: 1,
      marginLeft: sidebarOpen ? '250px' : '80px',
      transition: 'margin-left 0.3s ease'
    },
    header: {
      backgroundColor: theme.colors.cardBg,
      padding: '1rem 2rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    content: {
      padding: '2rem'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    },
    metricCard: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    metricIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    metricContent: {
      flex: 1
    },
    metricValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    metricLabel: {
      color: theme.colors.textSecondary,
      fontSize: '0.9rem'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem'
    },
    chartCard: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${theme.colors.border}`
    },
    chartTitle: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      marginBottom: '1rem'
    },
    alertsSection: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `1px solid ${theme.colors.border}`,
      marginBottom: '2rem'
    },
    alertItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: theme.colors.background,
      borderRadius: '8px',
      marginBottom: '0.5rem'
    },
    alertIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    button: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    loginContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: theme.colors.background
    },
    loginCard: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '400px',
      width: '90%',
      border: `1px solid ${theme.colors.border}`
    },
    loginTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '2rem',
      color: theme.colors.primary
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    input: {
      padding: '0.75rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontSize: '1rem'
    },
    message: {
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>📊 Manager Portal</h1>
          
          {error && (
            <div style={{...styles.message, ...styles.errorMessage}}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{...styles.message, ...styles.successMessage}}>
              {success}
            </div>
          )}

          <form
            style={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleLogin({
                username: formData.get('username'),
                password: formData.get('password')
              });
            }}
          >
            <input
              type="text"
              name="username"
              placeholder="Username"
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              style={styles.input}
            />
            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: theme.colors.background, borderRadius: '8px' }}>
            <strong>Test Credentials:</strong><br/>
            Username: manager1<br/>
            Password: password123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>📊 Manager</div>
          <button
            style={{ background: 'none', border: 'none', color: theme.colors.text, cursor: 'pointer' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav style={styles.sidebarNav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'stores', label: 'Stores', icon: Store },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map(item => (
            <div
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activeSection === item.id ? styles.navItemActive : {})
              }}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <User size={20} />
            {sidebarOpen && <span>{user?.first_name || user?.username}</span>}
          </div>
          <button
            style={{
              ...styles.button,
              backgroundColor: theme.colors.error,
              width: '100%',
              justifyContent: 'center'
            }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Manager Dashboard</h1>
          <div style={styles.headerActions}>
            {lastUpdated && (
              <span style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                Last updated: {lastUpdated}
              </span>
            )}
            <button
              style={styles.button}
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCw size={16} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={styles.content}>
          {error && (
            <div style={{...styles.message, ...styles.errorMessage}}>
              {error}
            </div>
          )}

          {/* Dashboard Metrics */}
          {activeSection === 'dashboard' && (
            <>
              <div style={styles.metricsGrid}>
                <div style={styles.metricCard}>
                  <div style={{...styles.metricIcon, backgroundColor: theme.colors.success}}>
                    <DollarSign size={24} />
                  </div>
                  <div style={styles.metricContent}>
                    <div style={styles.metricValue}>${dashboardData.totalSales?.toFixed(2) || '0.00'}</div>
                    <div style={styles.metricLabel}>Total Sales</div>
                  </div>
                </div>

                <div style={styles.metricCard}>
                  <div style={{...styles.metricIcon, backgroundColor: theme.colors.info}}>
                    <ShoppingCart size={24} />
                  </div>
                  <div style={styles.metricContent}>
                    <div style={styles.metricValue}>{dashboardData.totalOrders || 0}</div>
                    <div style={styles.metricLabel}>Total Orders</div>
                  </div>
                </div>

                <div style={styles.metricCard}>
                  <div style={{...styles.metricIcon, backgroundColor: theme.colors.primary}}>
                    <Store size={24} />
                  </div>
                  <div style={styles.metricContent}>
                    <div style={styles.metricValue}>{dashboardData.activeStores || 0}</div>
                    <div style={styles.metricLabel}>Active Stores</div>
                  </div>
                </div>

                <div style={styles.metricCard}>
                  <div style={{...styles.metricIcon, backgroundColor: theme.colors.warning}}>
                    <Users size={24} />
                  </div>
                  <div style={styles.metricContent}>
                    <div style={styles.metricValue}>{dashboardData.totalCustomers || 0}</div>
                    <div style={styles.metricLabel}>Total Customers</div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div style={styles.chartsGrid}>
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Sales Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke={theme.colors.primary} fill={theme.colors.primaryLight} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Store Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={storePerformance}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill={theme.colors.primary}
                        dataKey="value"
                        label
                      >
                        {storePerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory Alerts */}
              {inventoryAlerts.length > 0 && (
                <div style={styles.alertsSection}>
                  <h3 style={styles.chartTitle}>Inventory Alerts</h3>
                  {inventoryAlerts.map((alert, index) => (
                    <div key={index} style={styles.alertItem}>
                      <div style={{
                        ...styles.alertIcon,
                        backgroundColor: alert.level === 'critical' ? theme.colors.error : theme.colors.warning
                      }}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <strong>{alert.product_name}</strong>
                        <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notifications */}
              {notifications.length > 0 && (
                <div style={styles.alertsSection}>
                  <h3 style={styles.chartTitle}>Recent Notifications</h3>
                  {notifications.map((notification, index) => (
                    <div key={index} style={styles.alertItem}>
                      <div style={{...styles.alertIcon, backgroundColor: theme.colors.info}}>
                        <Bell size={20} />
                      </div>
                      <div>
                        <strong>{notification.title}</strong>
                        <div style={{ color: theme.colors.textSecondary, fontSize: '0.9rem' }}>
                          {notification.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Other sections */}
          {activeSection !== 'dashboard' && (
            <div style={styles.alertsSection}>
              <h2 style={styles.chartTitle}>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
              <p>This section is under development. Dashboard functionality is fully operational.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerApp;