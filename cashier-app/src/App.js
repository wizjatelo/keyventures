import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Package2, Package, RotateCcw, BarChart3, Users, Settings,
  Search, ScanLine, Plus, Minus, X, UserPlus, Edit2, Trash2, Image,
  Save, Filter, AlertCircle, CheckCircle, Menu, Bell, User, ChevronDown,
  Home, Tag, Layers, Grid, List, Eye, Upload, DollarSign
} from 'lucide-react';
import { cashierApi } from './services/api';
import { realTimeApiService, realTimeManager } from './services/managerApi';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CashierDashboard = () => {
  // Authentication
  const { user, isAuthenticated, isCashier, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a cashier
  useEffect(() => {
    if (!isAuthenticated() || !isCashier()) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, isCashier, navigate]);
  // UI State
  const [activeSection, setActiveSection] = useState('categories');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  
  // Loading and message states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Editing states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // File upload
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Form states
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newSubcategory, setNewSubcategory] = useState({ name: '', category: '', display_order: 0 });
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', barcode: '', category: '', subcategory: '', description: '',
    price: '', cost_price: '', stock: ''
  });

  // Theme colors based on dark mode
  const theme = {
    colors: {
      primary: darkMode ? '#FF8A5B' : '#FF6B35',
      primaryLight: darkMode ? '#E55A2B' : '#FF8A5B',
      primaryDark: darkMode ? '#FF6B35' : '#E55A2B',
      background: darkMode ? '#2C3E50' : '#F8F9FA',
      cardBg: darkMode ? '#34495E' : '#FFFFFF',
      text: darkMode ? '#FFFFFF' : '#2C3E50',
      textSecondary: darkMode ? '#BDC3C7' : '#7F8C8D',
      border: darkMode ? '#34495E' : '#E8EAED',
      success: '#27AE60',
      error: '#E74C3C',
      warning: '#F39C12',
      info: '#3498DB'
    },
    shadows: {
      sm: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
      md: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
      lg: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.15)'
    }
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      transition: 'background-color 0.3s ease'
    },
    sidebar: {
      width: sidebarOpen ? '250px' : '80px',
      backgroundColor: theme.colors.cardBg,
      boxShadow: theme.shadows.md,
      borderRadius: '2rem',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      zIndex: 20
    },
    mainContent: {
      flex: 1,
      marginLeft: sidebarOpen ? '250px' : '80px',
      transition: 'margin-left 0.3s ease'
    },
    header: {
      backgroundColor: theme.colors.primary,
      padding: '1rem 2rem',
      boxShadow: theme.shadows.md,
      display: 'flex',
      justifyContent: 'space-between',
      borderRadius: '100px',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    section: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '1rem',
      boxShadow: theme.shadows.sm,
      padding: '1.5rem',
      marginBottom: '1.5rem',
      transition: 'all 0.3s ease'
    },
    card: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '0.75rem',
      padding: '1rem',
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    button: {
      backgroundColor: theme.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontSize: '1rem'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modalContent: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  };

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial data fetching
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  // Real-time data synchronization
  useEffect(() => {
    // Start real-time polling for product updates
    realTimeManager.startPolling('product_updates', (data) => {
      if (data.products) {
        setProducts(data.products);
        console.log('🔄 Products updated in real-time:', data.products.length);
      }
    }, 15000); // Every 15 seconds

    // Start polling for category updates
    realTimeManager.startPolling('category_updates', (data) => {
      if (data.categories) {
        setCategories(data.categories);
        // Update subcategories from the nested data
        const allSubcategories = data.categories.flatMap(cat => 
          cat.subcategories.map(sub => ({
            ...sub,
            category: cat.id,
            category_name: cat.name
          }))
        );
        setSubcategories(allSubcategories);
        console.log('🔄 Categories updated in real-time:', data.categories.length);
      }
    }, 30000); // Every 30 seconds

    // Cleanup on unmount
    return () => {
      realTimeManager.stopAllPolling();
    };
  }, []);

  // Refetch subcategories when selected category changes
  useEffect(() => {
    fetchSubcategories();
  }, [selectedCategory]);

  // Refetch products when selected subcategory changes
  useEffect(() => {
    fetchProducts();
  }, [selectedSubcategory, searchQuery]);

  // Data fetching functions
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      console.log('🔍 Fetching categories...');
      const data = await cashierApi.getCategories();
      console.log('✅ Categories fetched:', data);
      setCategories(data);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError('Failed to fetch categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const data = await cashierApi.getSubcategories(selectedCategory !== 'all' ? selectedCategory : null);
      setSubcategories(data);
    } catch (err) {
      setError('Failed to fetch subcategories: ' + err.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await cashierApi.getProducts(searchQuery, selectedSubcategory !== 'all' ? selectedSubcategory : null);
      setProducts(data);
    } catch (err) {
      setError('Failed to fetch products: ' + err.message);
    }
  };

  // CRUD Handler Functions
  
  // Category handlers
  const handleAddCategory = async (e, formData) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await cashierApi.createCategory(formData);
      setSuccess('Category added successfully!');
      setShowAddCategory(false);
      fetchCategories(); // Refresh categories
      
      // Trigger real-time update for other dashboards
      setTimeout(async () => {
        try {
          const updatedCategories = await realTimeApiService.getCategoryUpdates();
          console.log('🔄 Broadcasting category update to other dashboards');
        } catch (err) {
          console.warn('Failed to broadcast category update:', err);
        }
      }, 1000);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId, formData) => {
    try {
      setLoading(true);
      setError(null);
      await cashierApi.updateCategory(categoryId, formData);
      setSuccess('Category updated successfully!');
      setEditingCategory(null);
      fetchCategories(); // Refresh categories
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await cashierApi.deleteCategory(categoryId);
      setSuccess('Category deleted successfully!');
      fetchCategories(); // Refresh categories
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Subcategory handlers
  const handleAddSubcategory = async (e, formData) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await cashierApi.createSubcategory(formData);
      setSuccess('Subcategory added successfully!');
      setShowAddSubcategory(false);
      fetchSubcategories(); // Refresh subcategories
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add subcategory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubcategory = async (subcategoryId, formData) => {
    try {
      setLoading(true);
      setError(null);
      await cashierApi.updateSubcategory(subcategoryId, formData);
      setSuccess('Subcategory updated successfully!');
      setEditingSubcategory(null);
      fetchSubcategories(); // Refresh subcategories
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update subcategory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await cashierApi.deleteSubcategory(subcategoryId);
      setSuccess('Subcategory deleted successfully!');
      fetchSubcategories(); // Refresh subcategories
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete subcategory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Product handlers
  const handleAddProduct = async (e, formData) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await cashierApi.createProduct(formData, selectedImage);
      setSuccess('Product added successfully!');
      setShowAddProduct(false);
      setSelectedImage(null);
      setImagePreview(null);
      fetchProducts(); // Refresh products
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to add product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (productId, formData) => {
    try {
      setLoading(true);
      setError(null);
      await cashierApi.updateProduct(productId, formData, selectedImage);
      setSuccess('Product updated successfully!');
      setEditingProduct(null);
      setSelectedImage(null);
      setImagePreview(null);
      fetchProducts(); // Refresh products
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      setError(null);
      await cashierApi.deleteProduct(productId);
      setSuccess('Product deleted successfully!');
      fetchProducts(); // Refresh products
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Image handling
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Clear any invalid tokens on component mount
  useEffect(() => {
    // Clear invalid tokens that might cause authentication errors
    const token = localStorage.getItem('token');
    if (token === 'null' || token === 'undefined' || token === '') {
      localStorage.removeItem('token');
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  // Refresh subcategories when category changes
  useEffect(() => {
    fetchSubcategories();
  }, [selectedCategory]);

  // Refresh products when search or subcategory changes
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedSubcategory]);



  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Navigation items
  const navItems = [
    { id: 'categories', label: 'Categories', icon: Layers, description: 'Manage product categories' },
    { id: 'subcategories', label: 'Subcategories', icon: Grid, description: 'Manage subcategories' },
    { id: 'products', label: 'Products', icon: Package, description: 'Manage products' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'View reports' }
  ];

  // Render functions
  const renderSidebar = () => (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Package2 style={{ color: theme.colors.primary, width: '32px', height: '32px' }} />
          {sidebarOpen && (
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: theme.colors.text }}>
                LineMart
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                Cashier Dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem' }}>
        {navItems.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: activeSection === id ? `${theme.colors.primary}20` : 'transparent',
              color: activeSection === id ? theme.colors.primary : theme.colors.text,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <Icon size={20} />
            {sidebarOpen && (
              <div>
                <div style={{ fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
                  {description}
                </div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Toggle button */}
      <div style={{ padding: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            color: theme.colors.textSecondary,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          <Menu size={20} />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div style={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 700 }}>
          {navItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '0.75rem',
          padding: '0.5rem 1rem',
          width: '300px'
        }}>
          <Search size={20} style={{ color: theme.colors.textSecondary, marginRight: '0.5rem' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: '1rem',
              color: '#2C3E50',
              background: 'transparent'
            }}
          />
        </div>

        {/* Debug button */}
        <button
          onClick={() => {
            localStorage.clear();
            console.log('🧹 LocalStorage cleared');
            window.location.reload();
          }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '12px'
          }}
          title="Clear localStorage and reload"
        >
          🧹 Debug
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF' }}>
          <User size={20} />
          <span style={{ fontWeight: 600 }}>Cashier</span>
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Categories</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Manage product categories. Total: {categories.length}
          </p>
        </div>
        <button
          onClick={() => setShowAddCategory(true)}
          style={styles.button}
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: `3px solid ${theme.colors.border}`,
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: theme.colors.textSecondary }}>Loading categories...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {categories.map(category => (
            <div key={category.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                    {category.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                    Subcategories: {category.subcategories?.length || 0}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setEditingCategory(category)}
                    style={{
                      backgroundColor: theme.colors.warning,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    style={{
                      backgroundColor: theme.colors.error,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{
                backgroundColor: theme.colors.background,
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                    Category ID: {category.id}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setActiveSection('subcategories');
                    }}
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    View Subcategories
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubcategories = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Subcategories</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Manage product subcategories. Total: {subcategories.length}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              ...styles.input,
              width: 'auto',
              minWidth: '200px'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddSubcategory(true)}
            style={styles.button}
          >
            <Plus size={20} />
            Add Subcategory
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {subcategories.map(subcategory => (
          <div key={subcategory.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                  {subcategory.name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                  Category: {subcategory.category_name}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setEditingSubcategory(subcategory)}
                  style={{
                    backgroundColor: theme.colors.warning,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteSubcategory(subcategory.id)}
                  style={{
                    backgroundColor: theme.colors.error,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div style={{
              backgroundColor: theme.colors.background,
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                  Order: {subcategory.display_order}
                </span>
                <button
                  onClick={() => {
                    setSelectedSubcategory(subcategory.id);
                    setActiveSection('products');
                  }}
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  View Products
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProducts = () => (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Products</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>
            Manage your product inventory. Total: {products.length}
          </p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          style={styles.button}
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ ...styles.input, width: 'auto', minWidth: '200px' }}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          style={{ ...styles.input, width: 'auto', minWidth: '200px' }}
        >
          <option value="all">All Subcategories</option>
          {subcategories.map(subcategory => (
            <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
      }}>
        {products.map(product => (
          <div key={product.id} style={styles.card}>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                {product.name}
              </h3>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                {product.description}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div><strong>SKU:</strong> {product.sku}</div>
                <div><strong>Price:</strong> ${product.price}</div>
                <div><strong>Stock:</strong> {product.stock}</div>
                <div><strong>Category:</strong> {product.category_name}</div>
              </div>
              {product.subcategory_name && (
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  <strong>Subcategory:</strong> {product.subcategory_name}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditingProduct(product)}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.warning,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem'
                }}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.error,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.25rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem'
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Modal components
  const CategoryModal = ({ show, onClose, category = null }) => {
    const [formData, setFormData] = useState(category || { name: '' });

    if (!show) return null;

    return (
      <div style={styles.modal} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {category ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={category ? (e) => {
            e.preventDefault();
            handleUpdateCategory(category.id, formData);
          } : (e) => handleAddCategory(e, formData)}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                placeholder="Enter category name"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving...' : (category ? 'Update' : 'Add')} Category
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const SubcategoryModal = ({ show, onClose, subcategory = null }) => {
    const [formData, setFormData] = useState(subcategory || { name: '', category: '', display_order: 0 });

    if (!show) return null;

    return (
      <div style={styles.modal} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {subcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
            </h3>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={subcategory ? (e) => {
            e.preventDefault();
            handleUpdateSubcategory(subcategory.id, formData);
          } : (e) => handleAddSubcategory(e, formData)}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Subcategory Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                placeholder="Enter subcategory name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={styles.input}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving...' : (subcategory ? 'Update' : 'Add')} Subcategory
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProductModal = ({ show, onClose, product = null }) => {
    const [formData, setFormData] = useState(product || {
      name: '', sku: '', barcode: '', category: '', subcategory: '', description: '',
      price: '', cost_price: '', stock: ''
    });

    if (!show) return null;

    return (
      <div style={styles.modal} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {product ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={product ? (e) => {
            e.preventDefault();
            handleUpdateProduct(product.id, formData);
          } : (e) => handleAddProduct(e, formData)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  style={styles.input}
                  placeholder="Enter SKU"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Subcategory
                </label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  style={styles.input}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Cost Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                  style={styles.input}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  style={styles.input}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
                placeholder="Enter product description"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Product Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={styles.input}
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{
                  marginTop: '0.5rem',
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '0.5rem'
                }} />
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving...' : (product ? 'Update' : 'Add')} Product
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {renderSidebar()}
      
      <div style={styles.mainContent}>
        {renderHeader()}
        
        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: `${theme.colors.error}20`,
            border: `1px solid ${theme.colors.error}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            margin: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} style={{ color: theme.colors.error }} />
            <span style={{ color: theme.colors.error }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: `${theme.colors.success}20`,
            border: `1px solid ${theme.colors.success}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            margin: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={20} style={{ color: theme.colors.success }} />
            <span style={{ color: theme.colors.success }}>{success}</span>
          </div>
        )}

        {/* Main Content */}
        <div style={{ padding: '2rem' }}>
          {activeSection === 'categories' && renderCategories()}
          {activeSection === 'subcategories' && renderSubcategories()}
          {activeSection === 'products' && renderProducts()}
          {activeSection === 'analytics' && (
            <div style={styles.section}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 700 }}>Analytics</h2>
              <p style={{ color: theme.colors.textSecondary }}>Analytics dashboard coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CategoryModal 
        show={showAddCategory || editingCategory} 
        onClose={() => {
          setShowAddCategory(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
      />
      
      <SubcategoryModal 
        show={showAddSubcategory || editingSubcategory} 
        onClose={() => {
          setShowAddSubcategory(false);
          setEditingSubcategory(null);
        }}
        subcategory={editingSubcategory}
      />
      
      <ProductModal 
        show={showAddProduct || editingProduct} 
        onClose={() => {
          setShowAddProduct(false);
          setEditingProduct(null);
          setSelectedImage(null);
          setImagePreview(null);
        }}
        product={editingProduct}
      />
    </div>
  );
};

export default CashierApp;