import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Bell, Settings, Menu, X, Store, Users, Package,
  TrendingUp, DollarSign, AlertTriangle, CheckCircle,
  Eye, FileText, Download, ShoppingCart, Star, Activity, RefreshCw
} from 'lucide-react';
import { BrowserRouter as Router, Route, Routes, NavLink, useLocation } from 'react-router-dom';
import StoresPage from './StoresPage';
import { managerApiService, realTimeManager } from './services/managerApi';

const ManagerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStore, setSelectedStore] = useState('all');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  // API Integration: Fetch all dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          dashboardRes,
          notificationsRes,
          approvalsRes,
          salesRes,
          performanceRes,
          inventoryRes,
          ordersRes,
          storesRes
        ] = await Promise.all([
          managerApiService.getDashboardMetrics(selectedStore),
          managerApiService.getNotifications(),
          managerApiService.getPendingApprovals(),
          managerApiService.getSalesData('weekly', selectedStore),
          managerApiService.getStorePerformance(),
          managerApiService.getInventoryAlerts(),
          managerApiService.getRecentOrders(),
          managerApiService.getStores()
        ]);

        // Update states with fetched data
        setDashboardData(dashboardRes);
        setNotifications(notificationsRes);
        setPendingApprovals(approvalsRes);
        setSalesData(salesRes);
        setStorePerformance(performanceRes);
        setInventoryAlerts(inventoryRes);
        setRecentOrders(ordersRes);
        setStores(storesRes);
        setLastUpdated(new Date().toISOString());

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStore]); // Re-fetch when store selection changes

  // Real-time polling setup
  useEffect(() => {
    // Start real-time polling for critical data
    realTimeManager.startPolling('dashboard_metrics', (data) => {
      setDashboardData(data);
      setLastUpdated(new Date().toISOString());
    }, 30000); // Every 30 seconds

    realTimeManager.startPolling('notifications', (data) => {
      setNotifications(data);
    }, 15000); // Every 15 seconds

    realTimeManager.startPolling('pending_approvals', (data) => {
      setPendingApprovals(data);
    }, 20000); // Every 20 seconds

    realTimeManager.startPolling('inventory_alerts', (data) => {
      setInventoryAlerts(data);
    }, 60000); // Every minute

    realTimeManager.startPolling('recent_orders', (data) => {
      setRecentOrders(data);
    }, 10000); // Every 10 seconds

    // Cleanup on unmount
    return () => {
      realTimeManager.stopAllPolling();
    };
  }, [selectedStore]);

  // API Integration: Handle approval actions
  const handleApproval = async (id, action, type) => {
    try {
      if (action === 'approve') {
        await managerApiService.approveRequest(id, type);
      } else {
        await managerApiService.rejectRequest(id, type);
      }
      
      // Remove from pending approvals
      setPendingApprovals(prev => prev.filter(approval => approval.id !== id));
      
      // Refresh notifications to show updated status
      const notificationsRes = await managerApiService.getNotifications();
      setNotifications(notificationsRes);
      
    } catch (err) {
      console.error(`Error ${action}ing approval:`, err);
      setError(`Failed to ${action} request: ${err.message}`);
    }
  };

  // API Integration: Refresh all data
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      // Refresh all data
      const [
        dashboardRes,
        notificationsRes,
        approvalsRes,
        salesRes,
        performanceRes,
        inventoryRes,
        ordersRes
      ] = await Promise.all([
        managerApiService.getDashboardMetrics(selectedStore),
        managerApiService.getNotifications(),
        managerApiService.getPendingApprovals(),
        managerApiService.getSalesData('weekly', selectedStore),
        managerApiService.getStorePerformance(),
        managerApiService.getInventoryAlerts(),
        managerApiService.getRecentOrders()
      ]);

      // Update states with new data
      setDashboardData(dashboardRes);
      setNotifications(notificationsRes);
      setPendingApprovals(approvalsRes);
      setSalesData(salesRes);
      setStorePerformance(performanceRes);
      setInventoryAlerts(inventoryRes);
      setRecentOrders(ordersRes);
      setLastUpdated(new Date().toISOString());

      setLoading(false);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to refresh data');
      setLoading(false);
    }
  };

  // Loading and Error UI
  if (loading && !dashboardData.totalSales) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <RefreshCw style={{ animation: 'spin 1s linear infinite', height: '3rem', width: '3rem', color: '#f97316' }} />
        <p style={{ marginTop: '1rem', fontSize: '1.25rem', color: '#6b7280' }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error && !dashboardData.totalSales) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <AlertTriangle style={{ height: '3rem', width: '3rem', color: '#ef4444' }} />
        <p style={{ marginTop: '1rem', fontSize: '1.25rem', color: '#ef4444' }}>{error}</p>
        <button
          onClick={handleRefresh}
          style={{ 
            marginTop: '1rem', 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#f97316', 
            color: 'white', 
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const statCardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    transform: 'translateY(0)',
  };

  const hoverStyle = {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-0.25rem)',
  };

  const notificationStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '1rem',
    transition: 'background-color 0.2s ease',
  };

  const approvalStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
  };

  const headerStyle = {
    background: 'linear-gradient(to right, #f97316, #f59e0b)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #f97316',
    padding: '1rem 2rem',
  };

  const sidebarStyle = {
    width: sidebarOpen ? '16rem' : '4rem',
    backgroundColor: '#ffffff',
    boxShadow: '2px 0 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
  };

  const mainStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    background: 'linear-gradient(to bottom right, #f9fafb, #e5e7eb)',
  };

  const StatCard = ({ title, value, change, icon: Icon, color = '#3b82f6' }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div
        style={{
          ...statCardStyle,
          ...(isHovered && hoverStyle),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', color: '#6b7280' }}>{title}</p>
            <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', marginTop: '0.5rem' }}>{value}</p>
            {change && (
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: change >= 0 ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                {change >= 0 ? '+' : ''}{change}% from last week
              </p>
            )}
          </div>
          <div style={{ backgroundColor: color, padding: '1rem', borderRadius: '9999px' }}>
            <Icon style={{ height: '2rem', width: '2rem', color: '#ffffff' }} />
          </div>
        </div>
      </div>
    );
  };

  const NotificationItem = ({ notification }) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconStyle = {
      padding: '0.5rem',
      borderRadius: '9999px',
      ...(notification.type === 'warning' && { backgroundColor: '#fefcbf' }),
      ...(notification.type === 'success' && { backgroundColor: '#d1fae5' }),
      ...(notification.type === 'info' && { backgroundColor: '#dbeafe' }),
    };
    return (
      <div
        style={{
          ...notificationStyle,
          ...(isHovered && { backgroundColor: '#f9fafb' }),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
          <div style={iconStyle}>
            {notification.type === 'warning' && <AlertTriangle style={{ height: '1.25rem', width: '1.25rem', color: '#f59e0b' }} />}
            {notification.type === 'success' && <CheckCircle style={{ height: '1.25rem', width: '1.25rem', color: '#10b981' }} />}
            {notification.type === 'info' && <Bell style={{ height: '1.25rem', width: '1.25rem', color: '#3b82f6' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '500' }}>{notification.message}</p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{notification.time}</p>
          </div>
        </div>
      </div>
    );
  };

  const ApprovalItem = ({ approval, onApprove, onReject }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div
        style={{
          ...approvalStyle,
          ...(isHovered && { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{approval.type}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>${approval.amount} • {approval.store}</p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{approval.time}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onApprove(approval.id)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#d1fae5',
                color: '#10b981',
                borderRadius: '0.5rem',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#a7f3d0')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#d1fae5')}
            >
              Approve
            </button>
            <button
              onClick={() => onReject(approval.id)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                borderRadius: '0.5rem',
                fontWeight: '500',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#fecaca')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#fee2e2')}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  };

  // This function is replaced by the API version above
  // const handleApproval = (id, action) => {
  //   setPendingApprovals(prev => prev.filter(approval => approval.id !== id));
  //   console.log(`${action} approval ${id}`);
  // };

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', ...( !sidebarOpen && { display: 'none' }) }}>
              KeywordVentures
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: '0.5rem', borderRadius: '9999px', transition: 'background-color 0.2s ease' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f9fafb')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              {sidebarOpen ? <X style={{ height: '1.5rem', width: '1.5rem' }} /> : <Menu style={{ height: '1.5rem', width: '1.5rem' }} />}
            </button>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '1rem 1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: Activity, label: 'Dashboard', active: true },
              { icon: Store, label: 'Stores' },
              { icon: Users, label: 'Staff' },
              { icon: Package, label: 'Inventory' },
              { icon: ShoppingCart, label: 'Orders' },
              { icon: TrendingUp, label: 'Analytics' },
              { icon: FileText, label: 'Reports' },
              { icon: Settings, label: 'Settings' }
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: item.active ? '#fff7ed' : 'transparent',
                  color: item.active ? '#f97316' : '#6b7280',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#fff7ed')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = item.active ? '#fff7ed' : 'transparent')}
              >
                <item.icon style={{ height: '1.5rem', width: '1.5rem' }} />
                {sidebarOpen && <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>{item.label}</span>}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={mainStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#ffffff' }}>Manager Dashboard</h2>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: '#1f2937',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  border: 'none',
                }}
              >
                <option value="all">All Stores</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                style={{
                  padding: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#ffffff')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)')}
                className="relative"
              >
                <Bell style={{ height: '1.5rem', width: '1.5rem', color: '#6b7280' }} />
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-0.25rem',
                    right: '-0.25rem',
                    height: '1.25rem',
                    width: '1.25rem',
                    backgroundColor: '#ef4444',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  padding: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  transition: 'background-color 0.2s ease',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#ffffff')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)')}
              >
                <RefreshCw 
                  style={{ 
                    height: '1.5rem', 
                    width: '1.5rem', 
                    color: '#6b7280',
                    animation: loading ? 'spin 1s linear infinite' : 'none'
                  }} 
                />
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: '#f97316',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#ffffff')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)')}
              >
                <Download style={{ height: '1.25rem', width: '1.25rem' }} />
                <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Export</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))', gap: '2rem' }}>
              <StatCard
                title="Total Sales"
                value={`$${dashboardData.totalSales.toLocaleString()}`}
                change={12.5}
                icon={DollarSign}
                color="#10b981"
              />
              <StatCard
                title="Orders"
                value={dashboardData.totalOrders.toLocaleString()}
                change={8.2}
                icon={ShoppingCart}
                color="#3b82f6"
              />
              <StatCard
                title="Active Stores"
                value={dashboardData.activeStores}
                change={0}
                icon={Store}
                color="#8b5cf6"
              />
              <StatCard
                title="Customers"
                value={dashboardData.totalCustomers.toLocaleString()}
                change={15.3}
                icon={Users}
                color="#6366f1"
              />
              <StatCard
                title="Conversion Rate"
                value={`${dashboardData.conversionRate}%`}
                change={-2.1}
                icon={TrendingUp}
                color="#f97316"
              />
              <StatCard
                title="Avg Order Value"
                value={`$${dashboardData.avgOrderValue}`}
                change={5.7}
                icon={Star}
                color="#ec4899"
              />
            </div>
          </div>

          {/* Charts and Tables Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '2rem' }}>
              {/* Sales Chart */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Sales Overview</h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ padding: '0.5rem 1rem', backgroundColor: '#fff7ed', color: '#f97316', borderRadius: '0.5rem', fontSize: '1rem' }}>Week</button>
                    <button style={{ padding: '0.5rem 1rem', color: '#6b7280', borderRadius: '0.5rem', fontSize: '1rem' }}>Month</button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#FF6B35" fill="#FF6B35" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="orders" stroke="#3498DB" fill="#3498DB" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Store Performance */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>Store Performance</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={storePerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      dataKey="value"
                      labelLine={false}
                    >
                      {storePerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {storePerformance.map((store, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '1rem', height: '1rem', borderRadius: '9999px', backgroundColor: store.color }}></div>
                        <span style={{ fontSize: '1rem', color: '#4b5563' }}>{store.name}</span>
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>{store.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: '2rem' }}>
              {/* Pending Approvals */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Pending Approvals</h3>
                  <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '9999px', fontSize: '1rem', fontWeight: '500' }}>
                    {pendingApprovals.length}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingApprovals.map((approval) => (
                    <ApprovalItem
                      key={approval.id}
                      approval={approval}
                      onApprove={(id) => handleApproval(id, 'approve', approval.type)}
                      onReject={(id) => handleApproval(id, 'reject', approval.type)}
                    />
                  ))}
                </div>
              </div>

              {/* Inventory Alerts */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>Inventory Alerts</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {inventoryAlerts.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{item.product}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Stock: {item.stock} | Reorder: {item.reorder}</p>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        ...(item.status === 'critical' ? { backgroundColor: '#fee2e2', color: '#ef4444' } : { backgroundColor: '#fefcbf', color: '#f59e0b' }),
                      }}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>Recent Orders</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentOrders.map((order, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                      <div>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>{order.id}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{order.customer} • {order.store}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>${order.amount}</p>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          ...(order.status === 'completed' ? { backgroundColor: '#d1fae5', color: '#10b981' } :
                            order.status === 'processing' ? { backgroundColor: '#dbeafe', color: '#3b82f6' } :
                            { backgroundColor: '#fefcbf', color: '#f59e0b' }),
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;