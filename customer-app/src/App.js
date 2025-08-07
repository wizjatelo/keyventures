import React, { useState, useEffect } from 'react';
import {
  Bell, ShoppingCart, Star, MapPin, User, Search,
  Tag, Percent, Home, Package, Gift, CreditCard,
  Settings, LogOut, ChevronDown, ChevronRight, ChevronLeft, Menu, X,
  Sun, Moon, Minus, Plus, Trash2
} from 'lucide-react';
import {
  LineChart, PieChart, BarChart,
  Line, Pie, Bar, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';
import { cashierApi } from './services/api';
import { realTimeApiService, realTimeManager } from './services/managerApi';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const CustomerDashboard = () => {
  // Authentication hooks
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // User state - use authenticated user data or guest defaults
  const [userProfile, setUserProfile] = useState({
    name: user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'Guest User',
    email: user?.email || 'guest@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    loyaltyPoints: isAuthenticated() ? 450 : 0,
    loyaltyTier: isAuthenticated() ? 'Silver' : 'Guest',
    nextTier: isAuthenticated() ? 'Gold (500 points needed)' : 'Login to earn points',
    totalSpent: isAuthenticated() ? 1250.75 : 0,
    lastVisit: '2025-06-25',
    paymentMethods: isAuthenticated() ? [
      { type: 'visa',   default: true },
      { type: 'mpesa',  default: false }
    ] : []
  });
  // Add this near your other state declarations
  const [searchResults, setSearchResults] = useState({
    products: [],
    orders: [],
    deals: []
  });

  // Add to your state declarations
  const [promoBanners, setPromoBanners] = useState([
    // Default banners (can be empty)
    {
      id: 1,
      title: "Summer Sale",
      subtitle: "Up to 50% off",
      image: "https://via.placeholder.com/800x200?text=Summer+Sale",
      link: "/shop?promo=summer",
      backgroundColor: "#FF6B35"
    }
  ]);

  // Add this useEffect for API fetching
  useEffect(() => {
    const fetchPromoBanners = async () => {
      try {
        // Use local API endpoint instead of external one
        // const response = await fetch('http://localhost:8000/api/customer/promo-banners/');
        // const data = await response.json();
        // if (data && data.length) {
        //   setPromoBanners(data);
        // }
        // For now, keep default banners
        console.log("Using default promo banners");
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
        // Keep default banners if API fails
      }
    };

    fetchPromoBanners();
  }, []);

  // Fetch products from backend cashier API with polling for real-time updates
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Cart and payment state
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cashierApi.getProducts();
      
      // Transform API data to match component structure
      const transformedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '/download.jpg', // fallback image
        category: product.category_name || 'Uncategorized',
        subcategory: product.subcategory_name || '',
        rating: 4.0, // default rating since backend doesn't have ratings
        description: product.description || '',
        stock: product.stock || 0
      }));
      
      setProducts(transformedProducts);
      console.log('Products fetched successfully:', transformedProducts);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await cashierApi.getCategories();
      // Format categories for dropdown: add 'all' option and extract category names
      const categoryNames = data.map(cat => cat.name);
      setCategories(['all', ...categoryNames]);
      console.log('Categories fetched successfully:', categoryNames);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      setCategories(['all']); // Fallback to 'all' only
    }
  };

  const fetchAdvertisements = async () => {
    try {
      const data = await cashierApi.getAdvertisements();
      setAdvertisements(data);
      console.log('Advertisements fetched successfully:', data);
    } catch (err) {
      console.error('Failed to load advertisements:', err);
      // Don't show error for advertisements, just keep empty array
      setAdvertisements([]);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchProducts();
    fetchCategories();
    fetchAdvertisements();

    // Real-time data synchronization using our centralized system
    realTimeManager.startPolling('product_updates', (data) => {
      if (data.products) {
        const transformedProducts = data.products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '/download.jpg',
          category: product.category || 'Uncategorized',
          subcategory: product.subcategory || '',
          rating: 4.0,
          description: product.description || '',
          stock: product.stock || 0
        }));
        setProducts(transformedProducts);
        console.log('🔄 Customer Dashboard: Products updated in real-time:', transformedProducts.length);
      }
    }, 8000); // Every 8 seconds for customer-facing updates

    realTimeManager.startPolling('category_updates', (data) => {
      if (data.categories) {
        const categoryNames = data.categories.map(cat => cat.name);
        setCategories(['all', ...categoryNames]);
        console.log('🔄 Customer Dashboard: Categories updated in real-time:', categoryNames.length);
      }
    }, 30000); // Every 30 seconds

    // Keep advertisements polling with traditional method since it's less critical
    const adInterval = setInterval(async () => {
      try {
        setRefreshing(true);
        await fetchAdvertisements();
        setRefreshing(false);
      } catch (err) {
        setRefreshing(false);
      }
    }, 60000); // Every minute for ads

    return () => {
      realTimeManager.stopAllPolling();
      clearInterval(adInterval);
    };
  }, []);

  // Cart functions
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Payment protection - require login for checkout
  const handleCheckout = () => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }
    // Proceed with checkout for authenticated users
    alert('Proceeding to checkout...');
  };

  const handleLoginPrompt = () => {
    setShowLoginPrompt(false);
    navigate('/login', { state: { from: { pathname: '/customer-dashboard' } } });
  };

  const handleLogout = () => {
    logout();
    setCart([]); // Clear cart on logout
    // Stay on customer dashboard as guest
  };

  // State-dependent functions will be declared after state initialization





  const filterItems = (query) => {
    if (!query) {
      return {
        products: [],
        orders: [],
        deals: []
      };
    }

    const lowerCaseQuery = query.toLowerCase();

    // Filter products
    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.category.toLowerCase().includes(lowerCaseQuery) ||
      product.description.toLowerCase().includes(lowerCaseQuery)
    );

    // Filter orders
    const filteredOrders = orders.filter(order =>
      order.id.toLowerCase().includes(lowerCaseQuery) ||
      order.status.toLowerCase().includes(lowerCaseQuery) ||
      order.paymentMethod.toLowerCase().includes(lowerCaseQuery)
    );

    // Filter deals
    const filteredDeals = deals.filter(deal =>
      deal.name.toLowerCase().includes(lowerCaseQuery) ||
      deal.category.toLowerCase().includes(lowerCaseQuery)
    );

    return {
      products: filteredProducts,
      orders: filteredOrders,
      deals: filteredDeals
    };
  };

  

  // UI state
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'Your order #ORD-005 is out for delivery', time: '2 hours ago', read: false },
    { id: 2, type: 'success', message: 'Earned 50 loyalty points on your last purchase', time: '1 day ago', read: true },
    { id: 3, type: 'warning', message: 'Special offer expires in 2 days', time: '3 days ago', read: true }
  ]);

  const [orders, setOrders] = useState([
    { id: 'ORD-005', date: '2025-07-30', total: 89.99, status: 'Out for Delivery', tracking: 'In Transit', items: 3, paymentMethod: 'visa' },
    { id: 'ORD-004', date: '2025-07-28', total: 45.50, status: 'Delivered', tracking: 'Completed', items: 2, paymentMethod: 'mpesa' },
    { id: 'ORD-003', date: '2025-07-01', total: 89.99, status: 'Out for Delivery', tracking: 'In Transit', items: 3, paymentMethod: 'visa' },
    { id: 'ORD-002', date: '2025-05-28', total: 45.50, status: 'Delivered', tracking: 'Completed', items: 2, paymentMethod: 'mpesa' },
    { id: 'ORD-001', date: '2025-05-11', total: 89.99, status: 'Out for Delivery', tracking: 'In Transit', items: 3, paymentMethod: 'visa' },
    { id: 'ORD-006', date: '2025-05-05', total: 45.50, status: 'Delivered', tracking: 'Completed', items: 2, paymentMethod: 'mpesa' },

  ]);

  // const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
    const [userCart, setUserCart] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
  // const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartTotal, setCartTotal] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, shipping, payment, confirmation
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'card' // card, paypal, mpesa
  });
  const [orderProcessing, setOrderProcessing] = useState(false);

  const [deals, setDeals] = useState([
    { id: 1, name: 'Summer Sale - 20% Off Electronics', discount: 20, image: 'https://via.placeholder.com/150', expires: '2025-07-10', category: 'Electronics' },
    { id: 2, name: 'Buy 1 Get 1 Free on Watches', discount: 50, image: 'https://via.placeholder.com/150', expires: '2025-07-05', category: 'Wearables' },
    { id: 3, name: 'Clearance - Up to 30% Off Fashion', discount: 30, image: 'https://via.placeholder.com/150', expires: '2025-07-08', category: 'Fashion' },
  ]);

  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Cart management functions
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Filter products by category
  const getFilteredProducts = () => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(product => product.category === selectedCategory);
  };

  // filterItems function already declared earlier

  // fetchSingleProduct function already declared earlier

  // Chart data
  const spendingData = [
    { name: 'Jan', amount: 400 },
    { name: 'Feb', amount: 300 },
    { name: 'Mar', amount: 600 },
    { name: 'Apr', amount: 800 },
    { name: 'May', amount: 500 },
    { name: 'Jun', amount: 900 },
    { name: 'Jul', amount: 350 },
    { name: 'Jul', amount: 350 },
    { name: 'Jul', amount: 350 },
    { name: 'Jul', amount: 350 },
    { name: 'Jul', amount: 350 },
    { name: 'Jul', amount: 350 },
    { name: 'Jul', amount: 350 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 45 },
    { name: 'Fashion', value: 25 },
    { name: 'Home', value: 15 },
    { name: 'Other', value: 15 },
  ];

  // Responsive sidebar toggle
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


  // Update your useEffect to handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults({ products: [], orders: [], deals: [] });
      return;
    }

    const results = filterItems(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  // Calculate cart total
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
    setCartTotal(total);
  }, [cart]);

  // Duplicate fetchProducts removed - using the one defined earlier

  // Remove duplicate API calls - using the ones defined earlier


  // Mock API call for user data
  useEffect(() => {
    // In a real app, this would fetch from your API
    const fetchUserData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Update state with fetched data
    };
    fetchUserData();
  }, []);



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
      borderRadius :  '2 rem'  ,
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      zIndex: 20,
      // Media queries handled by conditional logic
      ...(isMobile && {
        position: 'fixed',
        left: mobileSidebarOpen ? '0' : '-100%',
        width: '250px',
        transition: 'left 0.3s ease'
      })
    },
    mobileSidebarOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 15,
      display: mobileSidebarOpen ? 'block' : 'none'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      zIndex: 20,
      // Media queries handled by conditional logic
      ...(isMobile && {
        position: 'fixed',
        left: mobileSidebarOpen ? '0' : '-100%',
        width: '250px',
        transition: 'left 0.3s ease'
      })
    },
    mobileSidebarOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 15,
      display: mobileSidebarOpen ? 'block' : 'none'
    },
    mainContent: {
      flex: 1,
      marginLeft: isMobile ? '0' : (sidebarOpen ? '250px' : '80px'),
      transition: 'margin-left 0.3s ease'
    },
    header: {
      backgroundColor: theme.colors.primary,
      padding: '1rem 2rem',
      boxShadow: theme.shadows.md,
      display: 'flex',
      justifyContent: 'space-between',
      borderRadius :  '100 px' ,
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    logo: {
      color: '#FFFFFF',
      fontSize: '1.5rem',
      fontWeight: 700,
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '0.75rem',
      padding: '0.5rem 1rem',
      width: isMobile ? '200px' : '300px'
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      flex: 1,
      fontSize: '1rem',
      color: '#2C3E50',
      background: 'transparent'
    },
    nav: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      height: '18px',
      width: '18px',
      backgroundColor: theme.colors.error,
      borderRadius: '9999px',
      fontSize: '0.75rem',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    section: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '1rem',
      boxShadow: theme.shadows.sm,
      padding: '1.5rem',
      marginBottom: '1.5rem',
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: theme.colors.text,
      marginBottom: '1rem',
      borderBottom: `2px solid ${theme.colors.primary}`,
      paddingBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    card: {
      backgroundColor: darkMode ? '#2C3E50' : '#F8F9FA',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '1rem',
      transition: 'all 0.2s ease',
      border: `1px solid ${theme.colors.border}`,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.md
      }
    },
    productCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '1rem',
      borderRadius: '0.75rem',
      backgroundColor: darkMode ? '#2C3E50' : '#F8F9FA',
      marginBottom: '1rem',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.md
      }
    },
    dealCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      padding: '1rem',
      borderRadius: '0.75rem',
      backgroundColor: darkMode ? '#2C3E50' : '#F8F9FA',
      marginBottom: '1rem',
      transition: 'all 0.2s ease',
      borderLeft: `4px solid ${theme.colors.success}`,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows.md
      }
    },
    image: {
      width: isMobile ? '40px' : '80px',
      height: isMobile ? '40px' : '80px',
      borderRadius: '0.5rem',
      objectFit: 'cover',
      border: `2px solid ${theme.colors.primary}`
    },
    price: {
      fontSize: '1.1rem',
      color: theme.colors.text,
      fontWeight: 600
    },
    discount: {
      fontSize: '1.1rem',
      color: theme.colors.success,
      fontWeight: 600
    },
    statusIndicator: (status) => ({
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.5rem',
      fontSize: '0.8rem',
      fontWeight: 600,
      backgroundColor:
        status === 'Delivered' ? `${theme.colors.success}20` :
        status === 'Out for Delivery' ? `${theme.colors.warning}20` :
        `${theme.colors.info}20`,
      color:
        status === 'Delivered' ? theme.colors.success :
        status === 'Out for Delivery' ? theme.colors.warning :
        theme.colors.info
    }),
    sidebarItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      margin: '0.25rem 0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: theme.colors.text,
      textDecoration: 'none',
      '&:hover': {
        backgroundColor: `${theme.colors.primary}20`
      }
    },
    activeSidebarItem: {
      backgroundColor: `${theme.colors.primary}20`,
      color: theme.colors.primary,
      fontWeight: 600
    },
    sidebarIcon: {
      minWidth: '24px',
      marginRight: sidebarOpen ? '0.75rem' : '0',
      transition: 'all 0.3s ease'
    },
    sidebarText: {
      display: sidebarOpen ? 'block' : 'none',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    sidebarCollapseButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      cursor: 'pointer',
      color: theme.colors.text,
      '&:hover': {
        color: theme.colors.primary
      }
    },
    notificationPanel: {
      position: 'absolute',
      top: '60px',
      right: '20px',
      width: '350px',
      backgroundColor: theme.colors.cardBg,
      borderRadius: '0.75rem',
      boxShadow: theme.shadows.lg,
      zIndex: 30,
      maxHeight: '500px',
      overflowY: 'auto',
      display: showNotifications ? 'block' : 'none'
    },
    notificationItem: {
      padding: '1rem',
      borderBottom: `1px solid ${theme.colors.border}`,
      '&:last-child': {
        borderBottom: 'none'
      }
    },
    unreadNotification: {
      backgroundColor: `${theme.colors.info}10`
    },
    profileMenu: {
      position: 'absolute',
      top: '60px',
      right: '20px',
      width: '250px',
      backgroundColor: theme.colors.cardBg,
      borderRadius: '0.75rem',
      boxShadow: theme.shadows.lg,
      zIndex: 30,
      display: showProfileMenu ? 'block' : 'none'
    },
    chartContainer: {
      height: '300px',
      marginTop: '1rem'
    },
    orderDetail: {
      backgroundColor: theme.colors.cardBg,
      borderRadius: '0.75rem',
      padding: '1.5rem',
      marginTop: '1rem',
      boxShadow: theme.shadows.sm
    },
    paymentMethod: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      backgroundColor: `${theme.colors.primary}10`,
      marginBottom: '0.5rem'
    },
    mobileMenuButton: {
      display: 'none',
      '@media (max-width: 768px)': {
        display: 'block'
      }
    }
  };

  // Helper functions moved to top of component



  return (
    <div style={styles.container}>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          style={styles.mobileSidebarOverlay}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {sidebarOpen ? (
            <h2 style={{ color: theme.colors.primary, fontWeight: 700 }}>Keyword Ventures</h2>
          ) : (
            <h2 style={{ color: theme.colors.primary, fontWeight: 700 }}>KV</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: theme.colors.text, cursor: 'pointer' }}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav style={{ flex: 1, marginTop: '1rem' }}>
          <a
            href="#"
            style={{
              ...styles.sidebarItem,
              ...(activeSection === 'dashboard' && styles.activeSidebarItem)
            }}
            onClick={() => {
              setActiveSection('dashboard');
              setMobileSidebarOpen(false);
            }}
          >
            <Home size={20} style={styles.sidebarIcon} />
            <span style={styles.sidebarText}>Dashboard</span>
          </a>
          <a
            href="#"
            style={{
              ...styles.sidebarItem,
              ...(activeSection === 'shop' && styles.activeSidebarItem)
            }}
            onClick={() => {
              setActiveSection('shop');
              setMobileSidebarOpen(false);
            }}
          >
            <ShoppingCart size={20} style={styles.sidebarIcon} />
            <span style={styles.sidebarText}>Shop</span>
          </a>
          <a
            href="#"
            style={{
              ...styles.sidebarItem,
              ...(activeSection === 'cart' && styles.activeSidebarItem)
            }}
            onClick={() => {
              setActiveSection('cart');
              setMobileSidebarOpen(false);
            }}
          >
            <ShoppingCart size={20} style={styles.sidebarIcon} />
            <span style={styles.sidebarText}>
              Cart {cart.length > 0 && `(${cart.length})`}
            </span>
          </a>
          <a
            href="#"
            style={{
              ...styles.sidebarItem,
              ...(activeSection === 'orders' && styles.activeSidebarItem)
            }}
            onClick={() => {
              setActiveSection('orders');
              setMobileSidebarOpen(false);
            }}
          >
            <Package size={20} style={styles.sidebarIcon} />
            <span style={styles.sidebarText}>Orders</span>
          </a>
          <a
            href="#"
            style={{
              ...styles.sidebarItem,
              ...(activeSection === 'deals' && styles.activeSidebarItem)
            }}
            onClick={() => {
              setActiveSection('deals');
              setMobileSidebarOpen(false);
            }}
          >
            <Gift size={20} style={styles.sidebarIcon} />
            <span style={styles.sidebarText}>Deals</span>
          </a>
          <a
            href="#"
            style={{
              ...styles.sidebarItem,
              ...(activeSection === 'payments' && styles.activeSidebarItem)
            }}
            onClick={() => {
              setActiveSection('payments');
              setMobileSidebarOpen(false);
            }}
          >
            <CreditCard size={20} style={styles.sidebarIcon} />
            <span style={styles.sidebarText}>Payments</span>
          </a>
        </nav>

        <div style={{ marginBottom: '1rem' }}>
          <a
            href="#"
            style={{
              ...styles.sidebarItem,
              ...(activeSection === 'settings' && styles.activeSidebarItem)
            }}
            onClick={() => {
              setActiveSection('settings');
              setMobileSidebarOpen(false);
            }}
          >
            <Settings size={20} style={styles.sidebarIcon} />
            <span style={styles.sidebarText}>Settings</span>
          </a>
          {isAuthenticated() ? (
            <a
              href="#"
              style={styles.sidebarItem}
              onClick={() => {
                handleLogout();
                setMobileSidebarOpen(false);
              }}
            >
              <LogOut size={20} style={styles.sidebarIcon} />
              <span style={styles.sidebarText}>Logout</span>
            </a>
          ) : (
            <a
              href="#"
              style={styles.sidebarItem}
              onClick={() => {
                navigate('/login');
                setMobileSidebarOpen(false);
              }}
            >
              <User size={20} style={styles.sidebarIcon} />
              <span style={styles.sidebarText}>Login</span>
            </a>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <button
            style={styles.mobileMenuButton}
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          >
            {mobileSidebarOpen ? <X size={24} color="#FFF" /> : <Menu size={24} color="#FFF" />}
          </button>

          <div style={styles.searchBar}>
            <Search size={18} color={theme.colors.textSecondary} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, orders..."
              style={styles.searchInput}
            />
          </div>

          <div style={styles.nav}>
            {/* Cart Button */}
            <div style={{ position: 'relative', marginRight: '1rem' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '0.5rem'
                }}
                onClick={() => setShowCart(!showCart)}
              >
                <ShoppingCart size={22} color="#FFF" />
                {getCartItemCount() > 0 && (
                  <span style={{
                    ...styles.notificationBadge,
                    backgroundColor: '#ef4444'
                  }}>
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '0.5rem'
                }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={22} color="#FFF" />
                {unreadNotificationsCount > 0 && (
                  <span style={styles.notificationBadge}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications panel */}
              {showNotifications && (
                <div style={styles.notificationPanel}>
                  <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <h3 style={{ margin: 0 }}>Notifications</h3>
                  </div>
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        style={{
                          ...styles.notificationItem,
                          ...(!notification.read && styles.unreadNotification)
                        }}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: !notification.read ? theme.colors.info : 'transparent'
                          }} />
                          <div>
                            <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>{notification.message}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: theme.colors.textSecondary }}>
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <p style={{ margin: 0 }}>No notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFF'
                }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img
                  src={userProfile.avatar}
                  alt="Profile"
                  style={{
                    width: isMobile ? '16px' : '32px',
                    height: isMobile ? '16px' : '32px',
                    borderRadius: '50%',
                    border: '2px solid #FFF'
                  }}
                />
                {sidebarOpen && (
                  <>
                    <span>{userProfile.name.split(' ')[0]}</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>

              {/* Profile menu */}
              {showProfileMenu && (
                <div style={styles.profileMenu}>
                  <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={userProfile.avatar}
                        alt="Profile"
                        style={{
                          width: isMobile ? '24px' : '48px',
                          height: isMobile ? '24px' : '48px',
                          borderRadius: '50%',
                          border: `2px solid ${theme.colors.primary}`
                        }}
                      />
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem' }}>{userProfile.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                          {userProfile.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <a
                      href="#"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        color: theme.colors.text,
                        textDecoration: 'none',
                        '&:hover': {
                          backgroundColor: `${theme.colors.primary}10`
                        }
                      }}
                      onClick={() => {
                        setActiveSection('settings');
                        setShowProfileMenu(false);
                      }}
                    >
                      <User size={18} />
                      <span>Profile Settings</span>
                    </a>
                    <a
                      href="#"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        color: theme.colors.text,
                        textDecoration: 'none',
                        '&:hover': {
                          backgroundColor: `${theme.colors.primary}10`
                        }
                      }}
                      onClick={() => {
                        setDarkMode(!darkMode);
                        setShowProfileMenu(false);
                      }}
                    >
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </a>
                    <a
                      href="#"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        color: theme.colors.error,
                        textDecoration: 'none',
                        '&:hover': {
                          backgroundColor: `${theme.colors.error}10`
                        }
                      }}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

                {/* Add Search Results Dropdown RIGHT HERE - after header closing tag */}
                {searchQuery && (
                  <div style={{
                    position: 'absolute',
                    top: '80px', // Adjust based on your header height
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: '600px',
                    backgroundColor: theme.colors.cardBg,
                    boxShadow: theme.shadows.lg,
                    borderRadius: '0 0 0.75rem 0.75rem',
                    zIndex: 40,
                    padding: '1rem',
                    borderTop: `3px solid ${theme.colors.primary}`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <h4 style={{ margin: 0, color: theme.colors.text }}>Search Results</h4>
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.colors.textSecondary,
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {searchResults.products.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h5 style={{
                          margin: '0 0 0.5rem',
                          fontSize: '0.9rem',
                          color: theme.colors.textSecondary
                        }}>
                          Products ({searchResults.products.length})
                        </h5>
                        {searchResults.products.slice(0, 3).map(product => (
                          <div
                            key={product.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              borderRadius: '0.5rem',
                              ':hover': {
                                backgroundColor: `${theme.colors.primary}10`
                              }
                            }}
                            onClick={() => {
                              setActiveSection('shop');
                              setSearchQuery('');
                            }}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '0.5rem',
                                objectFit: 'cover',
                                border: `1px solid ${theme.colors.border}`
                              }}
                            />
                            <div>
                              <p style={{ margin: 0, fontWeight: 500, color: theme.colors.text }}>
                                {product.name}
                              </p>
                              <p style={{
                                margin: 0,
                                fontSize: '0.8rem',
                                color: theme.colors.textSecondary
                              }}>
                                ${product.price.toFixed(2)} • {product.category}
                              </p>
                            </div>
                          </div>
                        ))}
                        {searchResults.products.length > 3 && (
                          <p style={{
                            margin: '0.5rem 0 0',
                            fontSize: '0.8rem',
                            textAlign: 'right',
                            color: theme.colors.primary
                          }}>
                            +{searchResults.products.length - 3} more products
                          </p>
                        )}
                      </div>
                    )}

                    {/* Similar sections for Orders and Deals would go here */}
                    {/* ... */}

                    {searchResults.products.length === 0 &&
                     searchResults.orders.length === 0 &&
                     searchResults.deals.length === 0 && (
                      <div style={{
                        padding: '1rem',
                        textAlign: 'center'
                      }}>
                        <Search size={24} color={theme.colors.textSecondary} style={{ marginBottom: '0.5rem' }} />
                        <p style={{
                          margin: 0,
                          color: theme.colors.textSecondary
                        }}>
                          No results found for "<strong>{searchQuery}</strong>"
                        </p>
                      </div>
                    )}
                  </div>
                )}



        {/* Dashboard Content */}
        <div style={{ padding: '1.5rem' }}>
          {activeSection === 'dashboard' && (
            <>
              {/* Welcome Banner */}
              <div style={{
                ...styles.section,
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%)`,
                color: '#FFF'
              }}>
                <h2 style={{
                  ...styles.title,
                  color: '#FFF',
                  borderBottom: '2px solid rgba(255,255,255,0.3)'
                }}>
                  Welcome back, {userProfile.name.split(' ')[0]}!
                </h2>
                <p>You have {userProfile.loyaltyPoints} loyalty points. {userProfile.nextTier}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  position: 'relative',
                  height: '200px',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: theme.shadows.md
                }}>
                  {promoBanners.map(banner => (
                    <div key={banner.id} style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: banner.backgroundColor,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '2rem',
                      color: '#FFF'
                    }}>
                      <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem' }}>{banner.title}</h3>
                      <p style={{ fontSize: '1.25rem', margin: '0 0 1rem' }}>{banner.subtitle}</p>
                      <button style={{
                        alignSelf: 'flex-start',
                        backgroundColor: '#FFF',
                        color: banner.backgroundColor,
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        Shop Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: `${theme.colors.primary}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ShoppingCart color={theme.colors.primary} size={24} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                        Total Spent
                      </p>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        ${userProfile.totalSpent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: `${theme.colors.success}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Star color={theme.colors.success} size={24} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                        Loyalty Points
                      </p>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        {userProfile.loyaltyPoints}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: `${theme.colors.info}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package color={theme.colors.info} size={24} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                        Active Orders
                      </p>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        {orders.filter(o => o.status !== 'Delivered').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: `${theme.colors.warning}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Gift color={theme.colors.warning} size={24} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                        Active Deals
                      </p>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                        {deals.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={styles.section}>
                  <h3 style={styles.title}>Spending Trends</h3>
                  <div style={styles.chartContainer}>
                    <LineChart
                      width={400}
                      height={300}
                      data={spendingData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                      <XAxis dataKey="name" stroke={theme.colors.text} />
                      <YAxis stroke={theme.colors.text} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.colors.cardBg,
                          borderColor: theme.colors.border,
                          color: theme.colors.text
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke={theme.colors.primary}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </div>
                </div>

                <div style={styles.section}>
                  <h3 style={styles.title}>Spending by Category</h3>
                  <div style={styles.chartContainer}>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            theme.colors.primary,
                            theme.colors.success,
                            theme.colors.info,
                            theme.colors.warning
                          ][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.colors.cardBg,
                          borderColor: theme.colors.border,
                          color: theme.colors.text
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div style={styles.section}>
                <h3 style={styles.title}>Recent Orders</h3>
                {orders.slice(0, 3).map(order => (
                  <div
                    key={order.id}
                    style={styles.card}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>{order.id}</p>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                          {formatDate(order.date)} • {order.items} item{order.items !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>${order.total.toFixed(2)}</p>
                        <span style={styles.statusIndicator(order.status)}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Products */}
              <div style={styles.section}>
                <h3 style={styles.title}>Recommended For You</h3>
                {loading ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '200px',
                    color: theme.colors.textSecondary 
                  }}>
                    <p>Loading products...</p>
                  </div>
                ) : error ? (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '200px',
                    color: theme.colors.error,
                    textAlign: 'center'
                  }}>
                    <div>
                      <p>Failed to load products: {error}</p>
                      <button 
                        onClick={() => window.location.reload()}
                        style={{
                          backgroundColor: theme.colors.primary,
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.5rem 1rem',
                          cursor: 'pointer',
                          marginTop: '1rem'
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {products.slice(0, 4).map(product => (
                      <div key={product.id} style={styles.card}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '0.5rem',
                            marginBottom: '0.75rem'
                          }}
                          onError={(e) => {
                            e.target.src = '/download.jpg'; // Fallback image
                          }}
                        />
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>{product.name}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ margin: 0, fontWeight: 600, color: theme.colors.primary }}>
                            ${parseFloat(product.price || 0).toFixed(2)}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star size={16} fill="#F39C12" color="#F39C12" />
                            <span style={{ fontSize: '0.875rem' }}>{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Advertisement Section */}
              {advertisements.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.title}>Special Offers & Promotions</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    {advertisements.map(ad => (
                      <div 
                        key={ad.id} 
                        style={{
                          ...styles.card,
                          cursor: ad.link_url ? 'pointer' : 'default',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          ':hover': ad.link_url ? {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows.lg
                          } : {}
                        }}
                        onClick={() => {
                          if (ad.link_url) {
                            window.open(ad.link_url, '_blank');
                          }
                        }}
                      >
                        {ad.image && (
                          <img
                            src={ad.image}
                            alt={ad.title}
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
                        <h4 style={{ 
                          margin: '0 0 0.5rem', 
                          color: theme.colors.text,
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}>
                          {ad.title}
                        </h4>
                        {ad.description && (
                          <p style={{ 
                            margin: '0 0 1rem', 
                            color: theme.colors.textSecondary,
                            fontSize: '0.9rem',
                            lineHeight: '1.5'
                          }}>
                            {ad.description}
                          </p>
                        )}
                        {ad.link_url && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: theme.colors.primary,
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}>
                            <span>Learn More</span>
                            <span>→</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeSection === 'shop' && (
            <div style={styles.section}>
              <h2 style={styles.title}>All Products</h2>
              
              {/* Category Filter */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: theme.colors.text }}>Filter by Category:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        border: `2px solid ${theme.colors.primary}`,
                        backgroundColor: selectedCategory === category ? theme.colors.primary : 'transparent',
                        color: selectedCategory === category ? '#FFF' : theme.colors.primary,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '300px',
                  color: theme.colors.textSecondary 
                }}>
                  <p>Loading all products...</p>
                </div>
              ) : error ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '300px',
                  color: theme.colors.error,
                  textAlign: 'center'
                }}>
                  <div>
                    <p>Failed to load products: {error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      style={{
                        backgroundColor: theme.colors.primary,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        marginTop: '1rem'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {getFilteredProducts().map(product => (
                    <div key={product.id} style={styles.card}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: isMobile ? '90px' : '180px',
                          objectFit: 'cover',
                          borderRadius: '0.5rem',
                          marginBottom: '1rem'
                        }}
                        onError={(e) => {
                          e.target.src = '/download.jpg'; // Fallback image
                        }}
                      />
                      <p style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '1.1rem' }}>
                        {product.name}
                      </p>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                        {product.category}
                      </p>
                      <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: theme.colors.textSecondary, 
                                   overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', 
                                   WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: theme.colors.primary }}>
                          ${parseFloat(product.price || 0).toFixed(2)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star size={14} fill="#F39C12" color="#F39C12" />
                            <span style={{ fontSize: '0.75rem' }}>{product.rating}</span>
                          </div>
                          <button 
                            onClick={() => addToCart(product)}
                            style={{
                              backgroundColor: theme.colors.primary,
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '0.5rem',
                              padding: '0.5rem 1rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme.colors.primaryDark
                              }
                            }}>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'cart' && (
            <div style={styles.section}>
              <h2 style={styles.title}>Shopping Cart</h2>
              
              {cart.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem 1rem',
                  color: theme.colors.textSecondary 
                }}>
                  <ShoppingCart size={64} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <h3>Your cart is empty</h3>
                  <p>Add some products to get started!</p>
                  <button
                    onClick={() => setActiveSection('shop')}
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '1rem'
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div style={{ marginBottom: '2rem' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{
                        ...styles.card,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: isMobile ? '40px' : '80px',
                            height: isMobile ? '40px' : '80px',
                            objectFit: 'cover',
                            borderRadius: '0.5rem'
                          }}
                          onError={(e) => {
                            e.target.src = '/download.jpg';
                          }}
                        />
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{item.name}</h4>
                          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                            {item.category}
                          </p>
                          <p style={{ margin: 0, fontWeight: 600, color: theme.colors.primary }}>
                            ${parseFloat(item.price || 0).toFixed(2)}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '0.25rem',
                                border: `1px solid ${theme.colors.border}`,
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              -
                            </button>
                            <span style={{ 
                              minWidth: '32px', 
                              textAlign: 'center',
                              fontWeight: 600 
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '0.25rem',
                                border: `1px solid ${theme.colors.border}`,
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              +
                            </button>
                          </div>

                          <p style={{ 
                            margin: 0, 
                            fontWeight: 700, 
                            fontSize: '1.1rem',
                            minWidth: '80px',
                            textAlign: 'right'
                          }}>
                            ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                          </p>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.colors.error,
                              cursor: 'pointer',
                              padding: '0.5rem'
                            }}
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div style={{
                    ...styles.card,
                    backgroundColor: theme.colors.primary + '10',
                    border: `2px solid ${theme.colors.primary}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0 }}>Cart Summary</h3>
                      <button
                        onClick={clearCart}
                        style={{
                          background: 'none',
                          border: `1px solid ${theme.colors.error}`,
                          borderRadius: '0.25rem',
                          color: theme.colors.error,
                          cursor: 'pointer',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        Clear Cart
                      </button>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Shipping:</span>
                        <span>${cartTotal > 50 ? '0.00' : '9.99'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Tax:</span>
                        <span>${(cartTotal * 0.08).toFixed(2)}</span>
                      </div>
                      <hr style={{ border: `1px solid ${theme.colors.border}`, margin: '1rem 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                        <span>Total:</span>
                        <span>${(cartTotal + (cartTotal > 50 ? 0 : 9.99) + (cartTotal * 0.08)).toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => setActiveSection('shop')}
                        style={{
                          flex: 1,
                          backgroundColor: 'transparent',
                          color: theme.colors.primary,
                          border: `2px solid ${theme.colors.primary}`,
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Continue Shopping
                      </button>
                      <button
                        onClick={() => {
                          setCheckoutStep('shipping');
                          setShowCheckout(true);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: theme.colors.primary,
                          color: '#FFF',
                          border: 'none',
                          borderRadius: '0.5rem',
                          padding: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeSection === 'orders' && (
            <div>
              <div style={styles.section}>
                <h2 style={styles.title}>Your Orders</h2>
                {orders.map(order => (
                  <div
                    key={order.id}
                    style={{
                      ...styles.card,
                      ...(selectedOrder?.id === order.id && {
                        border: `2px solid ${theme.colors.primary}`
                      })
                    }}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>{order.id}</p>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                          {formatDate(order.date)} • {order.items} item{order.items !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>${order.total.toFixed(2)}</p>
                        <span style={styles.statusIndicator(order.status)}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder && (
                <div style={styles.orderDetail}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Order Details: {selectedOrder.id}</h3>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedOrder(null)}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <div style={styles.card}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Order Status</p>
                      <span style={styles.statusIndicator(selectedOrder.status)}>
                        {selectedOrder.status}
                      </span>
                    </div>

                    <div style={styles.card}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Order Date</p>
                      <p style={{ margin: 0 }}>{formatDate(selectedOrder.date)}</p>
                    </div>

                    <div style={styles.card}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Total Amount</p>
                      <p style={{ margin: 0 }}>${selectedOrder.total.toFixed(2)}</p>
                    </div>

                    <div style={styles.card}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>Payment Method</p>
                      <p style={{ margin: 0 }}>
                        {selectedOrder.paymentMethod === 'visa' ? 'Visa ending in 4242' : 'M-Pesa (254712345678)'}
                      </p>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 1rem' }}>Order Items</h4>
                  <div style={{ marginBottom: '1.5rem' }}>
                    {products.slice(0, selectedOrder.items).map(product => (
                      <div key={product.id} style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem 0',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>{product.name}</p>
                          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                            {product.category}
                          </p>
                          <p style={{ margin: 0, fontWeight: 600 }}>${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button style={{
                      backgroundColor: 'transparent',
                      color: theme.colors.primary,
                      border: `1px solid ${theme.colors.primary}`,
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: `${theme.colors.primary}10`
                      }
                    }}>
                      Track Order
                    </button>
                    <button style={{
                      backgroundColor: theme.colors.primary,
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.colors.primaryDark
                      }
                    }}>
                      Reorder
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'deals' && (
            <div style={styles.section}>
              <h2 style={styles.title}>Special Deals</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {deals.map(deal => (
                  <div key={deal.id} style={styles.card}>
                    <img
                      src={deal.image}
                      alt={deal.name}
                      style={{
                        width: '100%',
                        height: isMobile ? '90px' : '180px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        backgroundColor: `${theme.colors.success}20`,
                        color: theme.colors.success,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {deal.discount}% OFF
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: theme.colors.textSecondary
                      }}>
                        Expires: {formatDate(deal.expires)}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{deal.name}</h3>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                      {deal.category} • Limited time offer
                    </p>
                    <button style={{
                      width: '100%',
                      backgroundColor: theme.colors.primary,
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.colors.primaryDark
                      }
                    }}>
                      Shop Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div>
              <div style={styles.section}>
                <h2 style={styles.title}>Payment Methods</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  {userProfile.paymentMethods.map((method, index) => (
                    <div key={index} style={styles.paymentMethod}>
                      {method.type === 'visa' ? (
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
                          alt="Visa"
                          style={{ 
                            width: isMobile ? '20px' : '40px'
                          }}
                        />
                      ) : (
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
                          alt="M-Pesa"
                          style={{ 
                            width: isMobile ? '20px' : '40px'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 600 }}>
                          {method.type === 'visa' ? 'Visa ending in ' + method.last4 : 'M-Pesa: ' + method.phone}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: theme.colors.textSecondary }}>
                          {method.type === 'visa' ? 'Expires ' + method.expiry : 'Mobile Money'}
                        </p>
                      </div>
                      {method.default && (
                        <span style={{
                          backgroundColor: `${theme.colors.success}20`,
                          color: theme.colors.success,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <button style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.primary,
                  border: `1px solid ${theme.colors.primary}`,
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: `${theme.colors.primary}10`
                  }
                }}>
                  Add Payment Method
                </button>
              </div>

              <div style={styles.section}>
                <h2 style={styles.title}>Payment History</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Order ID</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Method</th>
                        <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem' }}>Amount</th>
                        <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr
                          key={index}
                          style={{
                            borderBottom: `1px solid ${theme.colors.border}`,
                            '&:hover': {
                              backgroundColor: `${theme.colors.primary}05`
                            }
                          }}
                        >
                          <td style={{ padding: '0.75rem 0.5rem' }}>{formatDate(order.date)}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{order.id}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            {order.paymentMethod === 'visa' ? 'Visa' : 'M-Pesa'}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                            ${order.total.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={styles.statusIndicator(order.status)}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div style={styles.section}>
              <h2 style={styles.title}>Account Settings</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={styles.card}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Profile Information</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                    />
                  </div>
                  <button style={{
                    width: '100%',
                    backgroundColor: theme.colors.primary,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.colors.primaryDark
                    }
                  }}>
                    Save Changes
                  </button>
                </div>

                <div style={styles.card}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Security</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                    />
                  </div>
                  <button style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    color: theme.colors.primary,
                    border: `1px solid ${theme.colors.primary}`,
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: `${theme.colors.primary}10`
                    }
                  }}>
                    Change Password
                  </button>
                </div>

                <div style={styles.card}>
                  <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Preferences</h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        Dark Mode
                      </label>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                          width: '50px',
                          height: '24px',
                          borderRadius: '12px',
                          backgroundColor: darkMode ? theme.colors.primary : theme.colors.border,
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '2px',
                          left: darkMode ? 'calc(100% - 22px)' : '2px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#FFF',
                          transition: 'all 0.2s ease'
                        }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      Notification Preferences
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked style={{ accentColor: theme.colors.primary }} />
                        <span>Order updates</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" checked style={{ accentColor: theme.colors.primary }} />
                        <span>Promotions</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" style={{ accentColor: theme.colors.primary }} />
                        <span>Newsletter</span>
                      </label>
                    </div>
                  </div>
                  <button style={{
                    width: '100%',
                    backgroundColor: theme.colors.primary,
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.colors.primaryDark
                    }
                  }}>
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: theme.colors.cardBg,
            borderRadius: '1rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowCheckout(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              <X size={24} />
            </button>

            {/* Checkout Steps */}
            <div style={{ padding: '2rem' }}>
              {/* Step Indicator */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '2rem',
                gap: '2rem'
              }}>
                {['shipping', 'payment', 'confirmation'].map((step, index) => (
                  <div key={step} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: checkoutStep === step ? theme.colors.primary : 
                                     ['shipping', 'payment', 'confirmation'].indexOf(checkoutStep) > index ? 
                                     theme.colors.success : theme.colors.border,
                      color: checkoutStep === step || ['shipping', 'payment', 'confirmation'].indexOf(checkoutStep) > index ? 
                             '#FFF' : theme.colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ 
                      textTransform: 'capitalize',
                      fontSize: '0.875rem',
                      color: checkoutStep === step ? theme.colors.primary : theme.colors.textSecondary
                    }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Information */}
              {checkoutStep === 'shipping' && (
                <div>
                  <h3 style={{ marginBottom: '1.5rem', color: theme.colors.text }}>Shipping Information</h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.colors.text
                      }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.colors.text
                      }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.colors.text
                    }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.colors.text
                    }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.colors.text
                    }}>
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }}
                      required
                    />
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.colors.text
                      }}>
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.colors.text
                      }}>
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text
                        }}
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: theme.colors.text
                      }}>
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => setShowCheckout(false)}
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        color: theme.colors.textSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Back to Cart
                    </button>
                    <button
                      onClick={() => {
                        if (shippingInfo.firstName && shippingInfo.lastName && shippingInfo.email && 
                            shippingInfo.phone && shippingInfo.address && shippingInfo.city && 
                            shippingInfo.state && shippingInfo.zipCode) {
                          setCheckoutStep('payment');
                        } else {
                          alert('Please fill in all required fields');
                        }
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.primary,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {checkoutStep === 'payment' && (
                <div>
                  <h3 style={{ marginBottom: '1.5rem', color: theme.colors.text }}>Payment Information</h3>
                  
                  {/* Payment Method Selection */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme.colors.text
                    }}>
                      Payment Method
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {[
                        { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                        { value: 'paypal', label: 'PayPal', icon: '🅿️' },
                        { value: 'mpesa', label: 'M-Pesa', icon: '📱' }
                      ].map(method => (
                        <label key={method.value} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          border: `2px solid ${paymentInfo.paymentMethod === method.value ? theme.colors.primary : theme.colors.border}`,
                          backgroundColor: paymentInfo.paymentMethod === method.value ? `${theme.colors.primary}10` : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={paymentInfo.paymentMethod === method.value}
                            onChange={(e) => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value})}
                            style={{ display: 'none' }}
                          />
                          <span>{method.icon}</span>
                          <span>{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Card Details */}
                  {paymentInfo.paymentMethod === 'card' && (
                    <div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.colors.text
                        }}>
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardholderName}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${theme.colors.border}`,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text
                          }}
                          required
                        />
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: theme.colors.text
                        }}>
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').substring(0, 16);
                            const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                            setPaymentInfo({...paymentInfo, cardNumber: formatted});
                          }}
                          placeholder="1234 5678 9012 3456"
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${theme.colors.border}`,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text
                          }}
                          required
                        />
                      </div>

                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: theme.colors.text
                          }}>
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + '/' + value.substring(2, 4);
                              }
                              setPaymentInfo({...paymentInfo, expiryDate: value});
                            }}
                            placeholder="MM/YY"
                            maxLength="5"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              border: `1px solid ${theme.colors.border}`,
                              backgroundColor: theme.colors.background,
                              color: theme.colors.text
                            }}
                            required
                          />
                        </div>
                        
                        <div>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: theme.colors.text
                          }}>
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').substring(0, 3);
                              setPaymentInfo({...paymentInfo, cvv: value});
                            }}
                            placeholder="123"
                            maxLength="3"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              borderRadius: '0.5rem',
                              border: `1px solid ${theme.colors.border}`,
                              backgroundColor: theme.colors.background,
                              color: theme.colors.text
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <h4 style={{ margin: '0 0 1rem', color: theme.colors.text }}>Order Summary</h4>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shipping:</span>
                      <span>${cartTotal > 50 ? '0.00' : '9.99'}</span>
                    </div>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax:</span>
                      <span>${(cartTotal * 0.08).toFixed(2)}</span>
                    </div>
                    <hr style={{ border: `1px solid ${theme.colors.border}`, margin: '0.5rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
                      <span>Total:</span>
                      <span>${(cartTotal + (cartTotal > 50 ? 0 : 9.99) + (cartTotal * 0.08)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => setCheckoutStep('shipping')}
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        color: theme.colors.textSecondary,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Back to Shipping
                    </button>
                    <button
                      onClick={() => {
                        setOrderProcessing(true);
                        // Simulate payment processing
                        setTimeout(() => {
                          setOrderProcessing(false);
                          setCheckoutStep('confirmation');
                        }, 3000);
                      }}
                      disabled={orderProcessing}
                      style={{
                        flex: 1,
                        backgroundColor: orderProcessing ? theme.colors.textSecondary : theme.colors.primary,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontWeight: 600,
                        cursor: orderProcessing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {orderProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}

              {/* Order Confirmation */}
              {checkoutStep === 'confirmation' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: theme.colors.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: '#FFF',
                    fontSize: '2rem'
                  }}>
                    ✓
                  </div>
                  
                  <h3 style={{ marginBottom: '1rem', color: theme.colors.text }}>Order Confirmed!</h3>
                  <p style={{ marginBottom: '1.5rem', color: theme.colors.textSecondary }}>
                    Thank you for your purchase. Your order has been successfully placed and you will receive a confirmation email shortly.
                  </p>
                  
                  <div style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    border: `1px solid ${theme.colors.border}`,
                    textAlign: 'left'
                  }}>
                    <h4 style={{ margin: '0 0 1rem', color: theme.colors.text }}>Order Details</h4>
                    <p><strong>Order ID:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p><strong>Total:</strong> ${(cartTotal + (cartTotal > 50 ? 0 : 9.99) + (cartTotal * 0.08)).toFixed(2)}</p>
                    <p><strong>Delivery Address:</strong> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                    <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => setActiveSection('orders')}
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        color: theme.colors.primary,
                        border: `1px solid ${theme.colors.primary}`,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Orders
                    </button>
                    <button
                      onClick={() => {
                        clearCart();
                        setShowCheckout(false);
                        setCheckoutStep('shipping');
                        setActiveSection('shop');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.primary,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Panel */}
            {showCart && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                width: '350px',
                maxHeight: '500px',
                backgroundColor: theme.colors.cardBg,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '0.5rem',
                boxShadow: theme.shadows.lg,
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.colors.border}` }}>
                  <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Shopping Cart
                    <button
                      onClick={() => setShowCart(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme.colors.textSecondary
                      }}
                    >
                      <X size={20} />
                    </button>
                  </h3>
                </div>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cart.length > 0 ? (
                    cart.map(item => (
                      <div key={item.id} style={{
                        padding: '1rem',
                        borderBottom: `1px solid ${theme.colors.border}`,
                        display: 'flex',
                        gap: '1rem'
                      }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '0.25rem'
                          }}
                          onError={(e) => {
                            e.target.src = '/download.jpg';
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>{item.name}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                border: `1px solid ${theme.colors.border}`,
                                background: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                border: `1px solid ${theme.colors.border}`,
                                background: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.colors.primary }}>
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                      <ShoppingCart size={48} color={theme.colors.textSecondary} style={{ marginBottom: '1rem' }} />
                      <p style={{ margin: 0, color: theme.colors.textSecondary }}>Your cart is empty</p>
                    </div>
                  )}
                </div>
                
                {cart.length > 0 && (
                  <div style={{ padding: '1rem', borderTop: `1px solid ${theme.colors.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontWeight: 600 }}>Total:</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 600, color: theme.colors.primary }}>
                        ${getCartTotal().toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      style={{
                        width: '100%',
                        backgroundColor: theme.colors.primary,
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.75rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {isAuthenticated() ? 'Proceed to Checkout' : 'Login to Checkout'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: theme.colors.cardBg,
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: theme.shadows.xl
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: `${theme.colors.primary}20`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <User size={32} color={theme.colors.primary} />
            </div>
            
            <h3 style={{
              margin: '0 0 1rem',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: theme.colors.text
            }}>
              Login Required
            </h3>
            
            <p style={{
              margin: '0 0 2rem',
              color: theme.colors.textSecondary,
              lineHeight: 1.5
            }}>
              You need to login to proceed with checkout. Create an account or sign in to continue shopping.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '0.375rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleLoginPrompt}
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerApp;