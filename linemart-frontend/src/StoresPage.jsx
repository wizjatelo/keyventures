import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Plus, Edit2, Trash2, Filter, Download, Upload, Eye, TrendingUp, TrendingDown, MapPin, DollarSign, Package, Users, Bell, Settings, Moon, Sun, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStores, setSelectedStores] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [currentStore, setCurrentStore] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [darkMode, setDarkMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [salesRangeFilter, setSalesRangeFilter] = useState({ min: '', max: '' });
  const [categoryFilter, setCategoryFilter] = useState('all');

  const storeCategories = ['flagship', 'outlet', 'kiosk', 'online', 'popup'];
  const categoryColors = {
    flagship: '#8B5CF6',
    outlet: '#10B981',
    kiosk: '#F59E0B',
    online: '#3B82F6',
    popup: '#EF4444'
  };

  // Enhanced sample data
  useEffect(() => {
    const enhancedData = [
      {
        id: 1,
        name: 'Downtown Flagship',
        location: '123 Main St, NYC',
        status: 'active',
        category: 'flagship',
        monthlySales: 125000,
        returns: 5000,
        targetSales: 130000,
        employees: 25,
        customerSatisfaction: 4.8,
        lastUpdate: '2025-07-18',
        coords: { lat: 40.7128, lng: -74.0060 },
        salesHistory: [
          { month: 'Jan', sales: 120000, returns: 4800 },
          { month: 'Feb', sales: 115000, returns: 4600 },
          { month: 'Mar', sales: 125000, returns: 5000 },
          { month: 'Apr', sales: 130000, returns: 5200 },
          { month: 'May', sales: 128000, returns: 5100 },
          { month: 'Jun', sales: 125000, returns: 5000 }
        ]
      },
      {
        id: 2,
        name: 'Mall Outlet',
        location: '456 Mall Ave, LA',
        status: 'active',
        category: 'outlet',
        monthlySales: 98000,
        returns: 3000,
        targetSales: 100000,
        employees: 18,
        customerSatisfaction: 4.5,
        lastUpdate: '2025-07-19',
        coords: { lat: 34.0522, lng: -118.2437 },
        salesHistory: [
          { month: 'Jan', sales: 95000, returns: 2850 },
          { month: 'Feb', sales: 92000, returns: 2760 },
          { month: 'Mar', sales: 98000, returns: 2940 },
          { month: 'Apr', sales: 105000, returns: 3150 },
          { month: 'May', sales: 100000, returns: 3000 },
          { month: 'Jun', sales: 98000, returns: 2940 }
        ]
      },
      {
        id: 3,
        name: 'Airport Kiosk',
        location: '789 Airport Rd, Miami',
        status: 'maintenance',
        category: 'kiosk',
        monthlySales: 42000,
        returns: 1500,
        targetSales: 45000,
        employees: 8,
        customerSatisfaction: 4.2,
        lastUpdate: '2025-07-17',
        coords: { lat: 25.7617, lng: -80.1918 },
        salesHistory: [
          { month: 'Jan', sales: 45000, returns: 1350 },
          { month: 'Feb', sales: 43000, returns: 1290 },
          { month: 'Mar', sales: 42000, returns: 1260 },
          { month: 'Apr', sales: 48000, returns: 1440 },
          { month: 'May', sales: 46000, returns: 1380 },
          { month: 'Jun', sales: 42000, returns: 1260 }
        ]
      },
      {
        id: 4,
        name: 'University Store',
        location: '101 Campus Dr, Boston',
        status: 'active',
        category: 'outlet',
        monthlySales: 76000,
        returns: 2000,
        targetSales: 80000,
        employees: 12,
        customerSatisfaction: 4.6,
        lastUpdate: '2025-07-19',
        coords: { lat: 42.3601, lng: -71.0589 },
        salesHistory: [
          { month: 'Jan', sales: 78000, returns: 2340 },
          { month: 'Feb', sales: 74000, returns: 2220 },
          { month: 'Mar', sales: 76000, returns: 2280 },
          { month: 'Apr', sales: 82000, returns: 2460 },
          { month: 'May', sales: 79000, returns: 2370 },
          { month: 'Jun', sales: 76000, returns: 2280 }
        ]
      },
      {
        id: 5,
        name: 'Popup Store - Times Square',
        location: 'Times Square, NYC',
        status: 'active',
        category: 'popup',
        monthlySales: 35000,
        returns: 800,
        targetSales: 40000,
        employees: 6,
        customerSatisfaction: 4.4,
        lastUpdate: '2025-07-18',
        coords: { lat: 40.7580, lng: -73.9855 },
        salesHistory: [
          { month: 'Jan', sales: 32000, returns: 960 },
          { month: 'Feb', sales: 30000, returns: 900 },
          { month: 'Mar', sales: 35000, returns: 1050 },
          { month: 'Apr', sales: 38000, returns: 1140 },
          { month: 'May', sales: 36000, returns: 1080 },
          { month: 'Jun', sales: 35000, returns: 1050 }
        ]
      }
    ];
    setStores(enhancedData);
  }, []);

  // Filtered and sorted stores
  const filteredStores = useMemo(() => {
    let filtered = stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           store.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || store.category === categoryFilter;
      const matchesSalesRange = (!salesRangeFilter.min || store.monthlySales >= parseInt(salesRangeFilter.min)) &&
                               (!salesRangeFilter.max || store.monthlySales <= parseInt(salesRangeFilter.max));

      return matchesSearch && matchesStatus && matchesCategory && matchesSalesRange;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [stores, searchTerm, statusFilter, categoryFilter, salesRangeFilter, sortField, sortDirection]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalSales = stores.reduce((sum, store) => sum + store.monthlySales, 0);
    const totalReturns = stores.reduce((sum, store) => sum + store.returns, 0);
    const avgSales = stores.length > 0 ? totalSales / stores.length : 0;
    const topPerformer = stores.reduce((max, store) => store.monthlySales > max.monthlySales ? store : max, stores[0] || {});
    const returnRate = totalSales > 0 ? (totalReturns / totalSales * 100).toFixed(2) : 0;

    return { totalSales, totalReturns, avgSales, topPerformer, returnRate };
  }, [stores]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedStores.size === filteredStores.length) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(filteredStores.map(store => store.id)));
    }
  };

  const handleStoreSelect = (storeId) => {
    const newSelected = new Set(selectedStores);
    if (newSelected.has(storeId)) {
      newSelected.delete(storeId);
    } else {
      newSelected.add(storeId);
    }
    setSelectedStores(newSelected);
  };

  const handleBulkAction = (action) => {
    const selectedStoresList = stores.filter(store => selectedStores.has(store.id));
    switch (action) {
      case 'activate':
        setStores(stores.map(store =>
          selectedStores.has(store.id) ? { ...store, status: 'active' } : store
        ));
        break;
      case 'deactivate':
        setStores(stores.map(store =>
          selectedStores.has(store.id) ? { ...store, status: 'inactive' } : store
        ));
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedStores.size} selected stores?`)) {
          setStores(stores.filter(store => !selectedStores.has(store.id)));
          setSelectedStores(new Set());
        }
        break;
    }
  };

  const openModal = (type, store = null) => {
    setModalType(type);
    setCurrentStore(store);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStore(null);
  };

  const handleSave = (storeData) => {
    if (modalType === 'add') {
      const newStore = {
        ...storeData,
        id: Math.max(...stores.map(s => s.id), 0) + 1,
        salesHistory: []
      };
      setStores([...stores, newStore]);
    } else {
      setStores(stores.map(store =>
        store.id === currentStore.id ? { ...store, ...storeData } : store
      ));
    }
    closeModal();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { color: '#059669', backgroundColor: '#D1FAE5' };
      case 'inactive': return { color: '#DC2626', backgroundColor: '#FEE2E2' };
      case 'maintenance': return { color: '#D97706', backgroundColor: '#FEF3C7' };
      default: return { color: '#4B5563', backgroundColor: '#F3F4F6' };
    }
  };

  const themeStyles = {
    container: {
      minHeight: '100vh',
      transition: 'background-color 300ms, color 300ms',
      backgroundColor: darkMode ? '#111827' : '#F9FAFB',
      color: darkMode ? 'white' : '#111827'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    card: {
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      backgroundColor: darkMode ? '#1F2937' : 'white'
    },
    input: {
      paddingLeft: '2.5rem',
      paddingRight: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      width: '100%',
      border: '1px solid',
      borderRadius: '0.5rem',
      outline: 'none',
      backgroundColor: darkMode ? '#374151' : 'white',
      borderColor: darkMode ? '#4B5563' : '#D1D5DB',
      color: darkMode ? 'white' : '#111827'
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    tableHeader: {
      backgroundColor: darkMode ? '#374151' : '#F9FAFB',
      textAlign: 'left',
      padding: '1rem 1.5rem'
    },
    tableRow: {
      borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
      '&:hover': {
        backgroundColor: darkMode ? '#1F2937' : '#F9FAFB'
      }
    },
    tableCell: {
      padding: '1rem 1.5rem'
    }
  };

  return (
    <div style={themeStyles.container}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem' }}>
        {/* Header */}
        <div style={themeStyles.header}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package style={{ width: '2rem', height: '2rem', color: '#2563EB' }} />
              Store Management
            </h1>
            <p style={{ marginTop: '0.5rem', color: darkMode ? '#9CA3AF' : '#4B5563' }}>
              Manage your store network efficiently
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: darkMode ? '#1F2937' : 'white',
                '&:hover': {
                  backgroundColor: darkMode ? '#374151' : '#F3F4F6'
                }
              }}
            >
              {darkMode ? <Sun style={{ width: '1.25rem', height: '1.25rem' }} /> : <Moon style={{ width: '1.25rem', height: '1.25rem' }} />}
            </button>
            <Bell style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', '&:hover': { color: '#2563EB' } }} />
            <Settings style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', '&:hover': { color: '#2563EB' } }} />
          </div>
        </div>

        {!selectedStore ? (
          <>
            {/* Analytics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={themeStyles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Total Sales</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${analytics.totalSales.toLocaleString()}</p>
                  </div>
                  <DollarSign style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
                </div>
              </div>

              <div style={themeStyles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Average Sales</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${analytics.avgSales.toLocaleString()}</p>
                  </div>
                  <TrendingUp style={{ width: '2rem', height: '2rem', color: '#3B82F6' }} />
                </div>
              </div>

              <div style={themeStyles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Return Rate</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.returnRate}%</p>
                  </div>
                  <TrendingDown style={{ width: '2rem', height: '2rem', color: '#EF4444' }} />
                </div>
              </div>

              <div style={themeStyles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Active Stores</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stores.filter(s => s.status === 'active').length}</p>
                  </div>
                  <Package style={{ width: '2rem', height: '2rem', color: '#8B5CF6' }} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ ...themeStyles.card, marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '16rem' }}>
                  <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={themeStyles.input}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                    color: darkMode ? 'white' : '#111827'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                    color: darkMode ? 'white' : '#111827'
                  }}
                >
                  <option value="all">All Categories</option>
                  {storeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                    '&:hover': {
                      backgroundColor: darkMode ? '#4B5563' : '#F3F4F6'
                    }
                  }}
                >
                  <Filter style={{ width: '1rem', height: '1rem' }} />
                  Filters
                  {showFilters ? <ChevronUp style={{ width: '1rem', height: '1rem' }} /> : <ChevronDown style={{ width: '1rem', height: '1rem' }} />}
                </button>
              </div>

              {showFilters && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Sales Range:</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={salesRangeFilter.min}
                      onChange={(e) => setSalesRangeFilter(prev => ({ ...prev, min: e.target.value }))}
                      style={{
                        padding: '0.25rem 0.75rem',
                        width: '6rem',
                        border: '1px solid',
                        borderRadius: '0.25rem',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                        color: darkMode ? 'white' : '#111827'
                      }}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={salesRangeFilter.max}
                      onChange={(e) => setSalesRangeFilter(prev => ({ ...prev, max: e.target.value }))}
                      style={{
                        padding: '0.25rem 0.75rem',
                        width: '6rem',
                        border: '1px solid',
                        borderRadius: '0.25rem',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                        color: darkMode ? 'white' : '#111827'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {selectedStores.size > 0 && (
                    <>
                      <span style={{ fontSize: '0.875rem', color: '#4B5563' }}>{selectedStores.size} selected</span>
                      <button
                        onClick={() => handleBulkAction('activate')}
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          backgroundColor: '#D1FAE5',
                          color: '#059669',
                          borderRadius: '0.25rem',
                          '&:hover': {
                            backgroundColor: '#A7F3D0'
                          }
                        }}
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleBulkAction('deactivate')}
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          borderRadius: '0.25rem',
                          '&:hover': {
                            backgroundColor: '#FECACA'
                          }
                        }}
                      >
                        Deactivate
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          borderRadius: '0.25rem',
                          '&:hover': {
                            backgroundColor: '#FECACA'
                          }
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => openModal('add')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      '&:hover': {
                        backgroundColor: '#1D4ED8'
                      }
                    }}
                  >
                    <Plus style={{ width: '1rem', height: '1rem' }} />
                    Add Store
                  </button>
                  <button style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                    '&:hover': {
                      backgroundColor: darkMode ? '#374151' : '#F3F4F6'
                    }
                  }}>
                    <Download style={{ width: '1rem', height: '1rem' }} />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Store Table */}
            <div style={{ ...themeStyles.card, borderRadius: '0.75rem', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%' }}>
                  <thead style={themeStyles.tableHeader}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>
                        <input
                          type="checkbox"
                          checked={selectedStores.size === filteredStores.length && filteredStores.length > 0}
                          onChange={handleSelectAll}
                          style={{ borderRadius: '0.25rem', borderColor: '#D1D5DB' }}
                        />
                      </th>
                      <th
                        style={{ ...themeStyles.tableHeader, cursor: 'pointer', '&:hover': { backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' } }}
                        onClick={() => handleSort('name')}
                      >
                        Store Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp style={{ display: 'inline', width: '1rem', height: '1rem', marginLeft: '0.25rem' }} /> :
                          <ChevronDown style={{ display: 'inline', width: '1rem', height: '1rem', marginLeft: '0.25rem' }} />
                        )}
                      </th>
                      <th style={themeStyles.tableHeader}>Category</th>
                      <th style={themeStyles.tableHeader}>Location</th>
                      <th style={themeStyles.tableHeader}>Status</th>
                      <th
                        style={{ ...themeStyles.tableHeader, cursor: 'pointer', '&:hover': { backgroundColor: darkMode ? '#4B5563' : '#F3F4F6' } }}
                        onClick={() => handleSort('monthlySales')}
                      >
                        Monthly Sales
                        {sortField === 'monthlySales' && (
                          sortDirection === 'asc' ? <ChevronUp style={{ display: 'inline', width: '1rem', height: '1rem', marginLeft: '0.25rem' }} /> :
                          <ChevronDown style={{ display: 'inline', width: '1rem', height: '1rem', marginLeft: '0.25rem' }} />
                        )}
                      </th>
                      <th style={themeStyles.tableHeader}>Performance</th>
                      <th style={themeStyles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderBottom: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}` }}>
                    {filteredStores.map(store => (
                      <tr key={store.id} style={{ ...themeStyles.tableRow, '&:hover': { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB' } }}>
                        <td style={themeStyles.tableCell}>
                          <input
                            type="checkbox"
                            checked={selectedStores.has(store.id)}
                            onChange={() => handleStoreSelect(store.id)}
                            style={{ borderRadius: '0.25rem', borderColor: '#D1D5DB' }}
                          />
                        </td>
                        <td
                          style={{ ...themeStyles.tableCell, fontWeight: '500', cursor: 'pointer', '&:hover': { color: '#2563EB' } }}
                          onClick={() => setSelectedStore(store)}
                        >
                          {store.name}
                        </td>
                        <td style={themeStyles.tableCell}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              color: 'white',
                              backgroundColor: categoryColors[store.category]
                            }}
                          >
                            {store.category}
                          </span>
                        </td>
                        <td style={{ ...themeStyles.tableCell, color: darkMode ? '#9CA3AF' : '#4B5563' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin style={{ width: '1rem', height: '1rem' }} />
                            {store.location}
                          </div>
                        </td>
                        <td style={themeStyles.tableCell}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            ...getStatusColor(store.status)
                          }}>
                            {store.status}
                          </span>
                        </td>
                        <td style={{ ...themeStyles.tableCell, fontWeight: '500' }}>
                          ${store.monthlySales.toLocaleString()}
                        </td>
                        <td style={themeStyles.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '4rem', backgroundColor: darkMode ? '#4B5563' : '#E5E7EB', borderRadius: '9999px', height: '0.5rem' }}>
                              <div
                                style={{
                                  height: '0.5rem',
                                  borderRadius: '9999px',
                                  backgroundColor: store.monthlySales >= store.targetSales ? '#10B981' : '#F59E0B',
                                  width: `${Math.min((store.monthlySales / store.targetSales) * 100, 100)}%`
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                              {((store.monthlySales / store.targetSales) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td style={themeStyles.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => setSelectedStore(store)}
                              style={{
                                padding: '0.25rem',
                                color: '#2563EB',
                                '&:hover': {
                                  backgroundColor: darkMode ? '#1E40AF' : '#DBEAFE'
                                },
                                borderRadius: '0.25rem'
                              }}
                            >
                              <Eye style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button
                              onClick={() => openModal('edit', store)}
                              style={{
                                padding: '0.25rem',
                                color: '#4B5563',
                                '&:hover': {
                                  backgroundColor: darkMode ? '#374151' : '#F3F4F6'
                                },
                                borderRadius: '0.25rem'
                              }}
                            >
                              <Edit2 style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this store?')) {
                                  setStores(stores.filter(s => s.id !== store.id));
                                }
                              }}
                              style={{
                                padding: '0.25rem',
                                color: '#DC2626',
                                '&:hover': {
                                  backgroundColor: darkMode ? '#7F1D1D' : '#FEE2E2'
                                },
                                borderRadius: '0.25rem'
                              }}
                            >
                              <Trash2 style={{ width: '1rem', height: '1rem' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Store Details View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setSelectedStore(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: darkMode ? '#1F2937' : 'white',
                  border: '1px solid',
                  borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                  '&:hover': {
                    backgroundColor: darkMode ? '#374151' : '#F3F4F6'
                  }
                }}
              >
                ← Back to List
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedStore.name} - Details</h2>
            </div>

            {/* Store Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={themeStyles.card}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Store Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Location</label>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin style={{ width: '1rem', height: '1rem', color: '#9CA3AF' }} />
                      {selectedStore.location}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Category</label>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: 'white',
                        backgroundColor: categoryColors[selectedStore.category],
                        marginTop: '0.25rem'
                      }}
                    >
                      {selectedStore.category}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Status</label>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      marginTop: '0.25rem',
                      ...getStatusColor(selectedStore.status)
                    }}>
                      {selectedStore.status}
                    </span>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Employees</label>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users style={{ width: '1rem', height: '1rem', color: '#9CA3AF' }} />
                      {selectedStore.employees} staff members
                    </p>
                  </div>
                </div>
              </div>

              <div style={themeStyles.card}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Performance Metrics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Sales Target</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {((selectedStore.monthlySales / selectedStore.targetSales) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: darkMode ? '#4B5563' : '#E5E7EB', borderRadius: '9999px', height: '0.75rem' }}>
                      <div
                        style={{
                          height: '0.75rem',
                          borderRadius: '9999px',
                          transition: 'all 500ms',
                          backgroundColor: selectedStore.monthlySales >= selectedStore.targetSales ? '#10B981' : '#F59E0B',
                          width: `${Math.min((selectedStore.monthlySales / selectedStore.targetSales) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                      <span>${selectedStore.monthlySales.toLocaleString()}</span>
                      <span>${selectedStore.targetSales.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Customer Satisfaction</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', color: '#F59E0B' }}>
                        {'★'.repeat(Math.floor(selectedStore.customerSatisfaction))}
                        {'☆'.repeat(5 - Math.floor(selectedStore.customerSatisfaction))}
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{selectedStore.customerSatisfaction}/5.0</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: darkMode ? '#9CA3AF' : '#4B5563' }}>Return Rate</label>
                    <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      {((selectedStore.returns / selectedStore.monthlySales) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div style={themeStyles.card}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={() => openModal('edit', selectedStore)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2563EB',
                      color: 'white',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'center',
                      '&:hover': {
                        backgroundColor: '#1D4ED8'
                      }
                    }}
                  >
                    <Edit2 style={{ width: '1rem', height: '1rem' }} />
                    Edit Store
                  </button>
                  <button style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10B981',
                    color: 'white',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: '#059669'
                    }
                  }}>
                    <Download style={{ width: '1rem', height: '1rem' }} />
                    Export Data
                  </button>
                  <button style={{
                    width: '100%',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#8B5CF6',
                    color: 'white',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: '#7C3AED'
                    }
                  }}>
                    <Bell style={{ width: '1rem', height: '1rem' }} />
                    Set Alerts
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              <div style={themeStyles.card}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Sales vs Returns Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedStore.salesHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1F2937' : 'white',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="Sales ($)" />
                    <Line type="monotone" dataKey="returns" stroke="#EF4444" strokeWidth={2} name="Returns ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={themeStyles.card}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Monthly Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedStore.salesHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1F2937' : 'white',
                        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#10B981" name="Sales ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Analytics */}
            <div style={themeStyles.card}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Performance Comparison</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3B82F6' }}>${selectedStore.monthlySales.toLocaleString()}</div>
                  <div style={{ fontSize: '0.875rem', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Current Month Sales</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10B981' }}>${selectedStore.targetSales.toLocaleString()}</div>
                  <div style={{ fontSize: '0.875rem', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Target Sales</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#EF4444' }}>${selectedStore.returns.toLocaleString()}</div>
                  <div style={{ fontSize: '0.875rem', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Returns</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8B5CF6' }}>{selectedStore.employees}</div>
                  <div style={{ fontSize: '0.875rem', color: darkMode ? '#9CA3AF' : '#6B7280' }}>Team Size</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Add/Edit Store */}
        {showModal && <StoreModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleSave}
          store={currentStore}
          type={modalType}
          darkMode={darkMode}
          categories={storeCategories}
        />}
      </div>
    </div>
  );
};

// Store Modal Component
const StoreModal = ({ isOpen, onClose, onSave, store, type, darkMode, categories }) => {
  const [formData, setFormData] = useState({
    name: store?.name || '',
    location: store?.location || '',
    status: store?.status || 'active',
    category: store?.category || 'outlet',
    targetSales: store?.targetSales || 0,
    employees: store?.employees || 1
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Store name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.targetSales || formData.targetSales <= 0) newErrors.targetSales = 'Target sales must be greater than 0';
    if (!formData.employees || formData.employees <= 0) newErrors.employees = 'Employee count must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      targetSales: parseInt(formData.targetSales),
      employees: parseInt(formData.employees),
      monthlySales: store?.monthlySales || 0,
      returns: store?.returns || 0,
      customerSatisfaction: store?.customerSatisfaction || 4.0,
      lastUpdate: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        borderRadius: '0.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        backgroundColor: darkMode ? '#1F2937' : 'white',
        color: darkMode ? 'white' : '#111827'
      }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            {type === 'add' ? 'Add New Store' : 'Edit Store'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: darkMode ? '#D1D5DB' : '#374151' }}>
                Store Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  backgroundColor: darkMode ? '#374151' : 'white',
                  borderColor: errors.name ? '#EF4444' : darkMode ? '#4B5563' : '#D1D5DB',
                  color: darkMode ? 'white' : '#111827',
                  '&:focus': {
                    ring: '2px',
                    ringColor: '#3B82F6',
                    borderColor: 'transparent'
                  }
                }}
                placeholder="Enter store name"
              />
              {errors.name && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: darkMode ? '#D1D5DB' : '#374151' }}>
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  backgroundColor: darkMode ? '#374151' : 'white',
                  borderColor: errors.location ? '#EF4444' : darkMode ? '#4B5563' : '#D1D5DB',
                  color: darkMode ? 'white' : '#111827',
                  '&:focus': {
                    ring: '2px',
                    ringColor: '#3B82F6',
                    borderColor: 'transparent'
                  }
                }}
                placeholder="Enter store location"
              />
              {errors.location && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.location}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: darkMode ? '#D1D5DB' : '#374151' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                    color: darkMode ? 'white' : '#111827',
                    '&:focus': {
                      ring: '2px',
                      ringColor: '#3B82F6',
                      borderColor: 'transparent'
                    }
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: darkMode ? '#D1D5DB' : '#374151' }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                    color: darkMode ? 'white' : '#111827',
                    '&:focus': {
                      ring: '2px',
                      ringColor: '#3B82F6',
                      borderColor: 'transparent'
                    }
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: darkMode ? '#D1D5DB' : '#374151' }}>
                  Target Sales *
                </label>
                <input
                  type="number"
                  value={formData.targetSales}
                  onChange={(e) => handleChange('targetSales', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    borderColor: errors.targetSales ? '#EF4444' : darkMode ? '#4B5563' : '#D1D5DB',
                    color: darkMode ? 'white' : '#111827',
                    '&:focus': {
                      ring: '2px',
                      ringColor: '#3B82F6',
                      borderColor: 'transparent'
                    }
                  }}
                  placeholder="0"
                />
                {errors.targetSales && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.targetSales}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', color: darkMode ? '#D1D5DB' : '#374151' }}>
                  Employees *
                </label>
                <input
                  type="number"
                  value={formData.employees}
                  onChange={(e) => handleChange('employees', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid',
                    borderRadius: '0.5rem',
                    outline: 'none',
                    backgroundColor: darkMode ? '#374151' : 'white',
                    borderColor: errors.employees ? '#EF4444' : darkMode ? '#4B5563' : '#D1D5DB',
                    color: darkMode ? 'white' : '#111827',
                    '&:focus': {
                      ring: '2px',
                      ringColor: '#3B82F6',
                      borderColor: 'transparent'
                    }
                  }}
                  placeholder="1"
                />
                {errors.employees && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.employees}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid',
                  borderRadius: '0.5rem',
                  '&:hover': {
                    backgroundColor: darkMode ? '#374151' : '#F3F4F6'
                  },
                  borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                  color: darkMode ? '#D1D5DB' : '#374151'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  '&:hover': {
                    backgroundColor: '#1D4ED8'
                  }
                }}
              >
                <Check style={{ width: '1rem', height: '1rem' }} />
                {type === 'add' ? 'Add Store' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;