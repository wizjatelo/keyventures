// API service for LineMart application
const API_URL = 'http://localhost:8000/api';

// Helper function for handling fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error message from response
    let errorMessage;
    try {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      
      // Handle different error formats
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'object') {
        // Handle field validation errors
        const fieldErrors = Object.entries(errorData).map(([field, errors]) => {
          if (Array.isArray(errors)) {
            return `${field}: ${errors.join(', ')}`;
          }
          return `${field}: ${errors}`;
        }).join('; ');
        errorMessage = fieldErrors || `Error: ${response.status}`;
      } else {
        errorMessage = `Error: ${response.status}`;
      }
    } catch (e) {
      errorMessage = `Error: ${response.status} - ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// JWT Token Management
const getAccessToken = () => {
  const token = localStorage.getItem('access_token');
  if (token === 'null' || token === 'undefined' || token === '') {
    localStorage.removeItem('access_token');
    return null;
  }
  return token;
};

const getRefreshToken = () => {
  const token = localStorage.getItem('refresh_token');
  if (token === 'null' || token === 'undefined' || token === '') {
    localStorage.removeItem('refresh_token');
    return null;
  }
  return token;
};

const setTokens = (tokens) => {
  if (tokens.access) {
    localStorage.setItem('access_token', tokens.access);
  }
  if (tokens.refresh) {
    localStorage.setItem('refresh_token', tokens.refresh);
  }
};

const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_permissions');
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Refresh access token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken || isTokenExpired(refreshToken)) {
    clearTokens();
    window.location.href = '/login';
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/member/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      clearTokens();
      window.location.href = '/login';
      return null;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    window.location.href = '/login';
    return null;
  }
};

// Headers without authentication
const getHeadersNoAuth = () => {
  return {
    'Content-Type': 'application/json',
  };
};

// Default headers with JWT auth token (synchronous version)
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAccessToken();
  
  // Only add authorization header if we have a valid token
  if (token && token !== 'null' && token !== 'undefined' && token.length > 0) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Async version for when token refresh is needed
const getHeadersAsync = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  let token = getAccessToken();
  
  // Check if token is expired and refresh if needed
  if (token && isTokenExpired(token)) {
    token = await refreshAccessToken();
  }
  
  // Only add authorization header if we have a valid token
  if (token && token !== 'null' && token !== 'undefined' && token.length > 0) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Legacy token support (for backward compatibility)
const getToken = () => {
  return getAccessToken();
};

// Authentication API
export const authApi = {
  // Customer authentication
  customerLogin: async (credentials) => {
    const response = await fetch(`${API_URL}/member/auth/customer/login/`, {
      method: 'POST',
      headers: getHeadersNoAuth(),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    if (data.tokens) {
      setTokens(data.tokens);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_permissions', JSON.stringify(data.user.permissions));
    }
    
    return data;
  },

  customerRegister: async (userData) => {
    const response = await fetch(`${API_URL}/member/auth/customer/register/`, {
      method: 'POST',
      headers: getHeadersNoAuth(),
      body: JSON.stringify(userData),
    });
    const data = await handleResponse(response);
    
    if (data.tokens) {
      setTokens(data.tokens);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_permissions', JSON.stringify(data.user.permissions));
    }
    
    return data;
  },

  // Cashier authentication
  cashierLogin: async (credentials) => {
    const response = await fetch(`${API_URL}/member/auth/cashier/login/`, {
      method: 'POST',
      headers: getHeadersNoAuth(),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    if (data.tokens) {
      setTokens(data.tokens);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_permissions', JSON.stringify(data.user.permissions));
    }
    
    return data;
  },

  // Manager authentication
  managerLogin: async (credentials) => {
    const response = await fetch(`${API_URL}/member/auth/manager/login/`, {
      method: 'POST',
      headers: getHeadersNoAuth(),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    if (data.tokens) {
      setTokens(data.tokens);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_permissions', JSON.stringify(data.user.permissions));
    }
    
    return data;
  },

  // Universal logout
  logout: async () => {
    const refreshToken = getRefreshToken();
    
    try {
      const response = await fetch(`${API_URL}/member/auth/logout/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      });
      await handleResponse(response);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens locally
      clearTokens();
    }
  },

  // Check user permissions
  checkPermissions: async () => {
    const response = await fetch(`${API_URL}/member/permissions/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Refresh token
  refreshToken: async () => {
    return refreshAccessToken();
  },

  // Password reset functionality
  requestPasswordReset: async (email) => {
    const response = await fetch(`${API_URL}/member/auth/password-reset/request/`, {
      method: 'POST',
      headers: getHeadersNoAuth(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_URL}/member/auth/password-reset/confirm/`, {
      method: 'POST',
      headers: getHeadersNoAuth(),
      body: JSON.stringify({ 
        token,
        new_password: newPassword 
      }),
    });
    return handleResponse(response);
  },

  verifyResetToken: async (token) => {
    const response = await fetch(`${API_URL}/member/auth/password-reset/verify/`, {
      method: 'POST',
      headers: getHeadersNoAuth(),
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  }
};

// API functions
export const customerApi = {
  // Auth (legacy - use authApi instead)
  login: async (credentials) => {
    return authApi.customerLogin(credentials);
  },
  
  register: async (userData) => {
    return authApi.customerRegister(userData);
  },
  
  logout: async () => {
    return authApi.logout();
  },
  
  // User profile
  getProfile: async () => {
    const response = await fetch(`${API_URL}/customer/profile/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/customer/profile/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
  
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await fetch(`${API_URL}/customer/dashboard-stats/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  // Products
  getProducts: async (category = null) => {
    let url = `${API_URL}/customer/products/`;
    if (category && category !== 'all') {
      url += `?category=${category}`;
    }
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  getProductCategories: async () => {
    const response = await fetch(`${API_URL}/customer/products/categories/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  getProductById: async (productId) => {
    const response = await fetch(`${API_URL}/customer/products/${productId}/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  // Orders
  getOrders: async () => {
    const response = await fetch(`${API_URL}/customer/orders/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  getOrderById: async (orderId) => {
    const response = await fetch(`${API_URL}/customer/orders/${orderId}/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  createOrder: async (orderData) => {
    const response = await fetch(`${API_URL}/customer/orders/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },
  
  // Payment methods
  getPaymentMethods: async () => {
    const response = await fetch(`${API_URL}/customer/payment-methods/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  addPaymentMethod: async (paymentData) => {
    const response = await fetch(`${API_URL}/customer/payment-methods/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },
  
  updatePaymentMethod: async (paymentId, paymentData) => {
    const response = await fetch(`${API_URL}/customer/payment-methods/${paymentId}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },
  
  deletePaymentMethod: async (paymentId) => {
    const response = await fetch(`${API_URL}/customer/payment-methods/${paymentId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  },
  
  // Notifications
  getNotifications: async () => {
    const response = await fetch(`${API_URL}/customer/notifications/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  markNotificationAsRead: async (notificationId) => {
    const response = await fetch(`${API_URL}/customer/notifications/${notificationId}/mark_read/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  markAllNotificationsAsRead: async () => {
    const response = await fetch(`${API_URL}/customer/notifications/mark_all_read/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  // Deals
  getDeals: async (category = null) => {
    let url = `${API_URL}/customer/deals/`;
    if (category) {
      url += `?category=${category}`;
    }
    
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  // Promo banners
  getPromoBanners: async () => {
    const response = await fetch(`${API_URL}/customer/promo-banners/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Cashier API functions
export const cashierApi = {
  // Products
  getProducts: async (query = '', subcategoryId = null) => {
    let url = `${API_URL}/cashier/products/`;
    const params = [];
    
    if (query) {
      params.push(`search=${query}`);
    }
    
    if (subcategoryId) {
      params.push(`subcategory=${subcategoryId}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    const response = await fetch(url, {
      headers: getHeadersNoAuth(), // Use no-auth headers for testing
    });
    return handleResponse(response);
  },
  
  getProductById: async (productId) => {
    const response = await fetch(`${API_URL}/cashier/products/${productId}/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  createProduct: async (productData, productImage = null) => {
    console.log('🔧 API createProduct called with:', { productData, productImage });
    
    // If there's an image, use FormData to send multipart/form-data
    if (productImage) {
      console.log('📷 Using FormData for image upload');
      const formData = new FormData();
      
      // Add all product data to formData
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });
      
      // Add the image file
      formData.append('image', productImage);
      
      const response = await fetch(`${API_URL}/cashier/products/`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type, it will be set automatically with boundary
          // No authorization headers for testing
        },
        body: formData,
      });
      
      console.log('📷 FormData response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📷 FormData error response:', errorText);
      }
      
      return handleResponse(response);
    } else {
      console.log('📝 Using JSON for product without image');
      // No image, use JSON - remove image field if it exists
      const cleanProductData = { ...productData };
      if ('image' in cleanProductData) {
        console.log('🗑️ Removing image field from data');
        delete cleanProductData.image;
      }
      
      console.log('📤 Sending JSON data:', cleanProductData);
      const response = await fetch(`${API_URL}/cashier/products/`, {
        method: 'POST',
        headers: getHeadersNoAuth(), // Use no-auth headers for testing
        body: JSON.stringify(cleanProductData),
      });
      return handleResponse(response);
    }
  },
  
  updateProduct: async (productId, productData, productImage = null) => {
    // If there's an image, use FormData to send multipart/form-data
    if (productImage) {
      const formData = new FormData();
      
      // Add all product data to formData
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });
      
      // Add the image file
      formData.append('image', productImage);
      
      const response = await fetch(`${API_URL}/cashier/products/${productId}/`, {
        method: 'PUT',
        headers: {
          // Don't set Content-Type, it will be set automatically with boundary
          'Authorization': getHeaders().Authorization
        },
        body: formData,
      });
      return handleResponse(response);
    } else {
      // No image, use JSON
      const response = await fetch(`${API_URL}/cashier/products/${productId}/`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      return handleResponse(response);
    }
  },
  
  deleteProduct: async (productId) => {
    const response = await fetch(`${API_URL}/cashier/products/${productId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  },
  
  // Product stock management
  updateProductStock: async (productId, stockData) => {
    const response = await fetch(`${API_URL}/cashier/products/${productId}/update-stock/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(stockData),
    });
    return handleResponse(response);
  },
  
  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/cashier/categories/`, {
      headers: getHeadersNoAuth(), // Use no-auth headers for testing
    });
    return handleResponse(response);
  },
  
  // Subcategories
  getSubcategories: async (categoryId = null) => {
    let url = `${API_URL}/cashier/subcategories/`;
    if (categoryId) {
      url += `?category=${categoryId}`;
    }
    
    const response = await fetch(url, {
      headers: getHeadersNoAuth(), // Use no-auth headers for testing
    });
    return handleResponse(response);
  },
  
  getSubcategoryById: async (subcategoryId) => {
    const response = await fetch(`${API_URL}/cashier/subcategories/${subcategoryId}/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  createSubcategory: async (subcategoryData) => {
    const response = await fetch(`${API_URL}/cashier/subcategories/`, {
      method: 'POST',
      headers: getHeadersNoAuth(), // Use no-auth headers for testing
      body: JSON.stringify(subcategoryData),
    });
    return handleResponse(response);
  },
  
  updateSubcategory: async (subcategoryId, subcategoryData) => {
    const response = await fetch(`${API_URL}/cashier/subcategories/${subcategoryId}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(subcategoryData),
    });
    return handleResponse(response);
  },
  
  deleteSubcategory: async (subcategoryId) => {
    const response = await fetch(`${API_URL}/cashier/subcategories/${subcategoryId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  },
  
  getCategoryById: async (categoryId) => {
    const response = await fetch(`${API_URL}/cashier/categories/${categoryId}/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  createCategory: async (categoryData) => {
    const response = await fetch(`${API_URL}/cashier/categories/`, {
      method: 'POST',
      headers: getHeadersNoAuth(), // Use no-auth headers for testing
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },
  
  updateCategory: async (categoryId, categoryData) => {
    const response = await fetch(`${API_URL}/cashier/categories/${categoryId}/`, {
      method: 'PUT',
      headers: getHeadersNoAuth(), // Use no-auth headers for testing
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },

  deleteCategory: async (categoryId) => {
    const response = await fetch(`${API_URL}/cashier/categories/${categoryId}/`, {
      method: 'DELETE',
      headers: getHeadersNoAuth(), // Use no-auth headers for testing
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  },
  
  // Transactions
  getTransactions: async () => {
    const response = await fetch(`${API_URL}/cashier/transactions/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  
  createTransaction: async (transactionData) => {
    const response = await fetch(`${API_URL}/cashier/transactions/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transactionData),
    });
    return handleResponse(response);
  },
  
  getTransactionById: async (transactionId) => {
    const response = await fetch(`${API_URL}/cashier/transactions/${transactionId}/`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Advertisements
  getAdvertisements: async () => {
    const response = await fetch(`${API_URL}/cashier/advertisements/`, {
      headers: getHeadersNoAuth(), // Public access for customer dashboard
    });
    return handleResponse(response);
  },

  createAdvertisement: async (adData, adImage) => {
    console.log('🔧 API createAdvertisement called with:', { adData, adImage });
    
    // If there's an image, use FormData to send multipart/form-data
    if (adImage) {
      console.log('📷 Using FormData for image upload');
      const formData = new FormData();
      
      // Add all advertisement data to formData
      Object.keys(adData).forEach(key => {
        formData.append(key, adData[key]);
      });
      
      // Add the image file
      formData.append('image', adImage);
      
      const response = await fetch(`${API_URL}/cashier/advertisements/`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type, it will be set automatically with boundary
        },
        body: formData,
      });
      
      return handleResponse(response);
    } else {
      // No image, use JSON
      const response = await fetch(`${API_URL}/cashier/advertisements/`, {
        method: 'POST',
        headers: getHeadersNoAuth(),
        body: JSON.stringify(adData),
      });
      return handleResponse(response);
    }
  },

  updateAdvertisement: async (adId, adData, adImage) => {
    if (adImage) {
      const formData = new FormData();
      Object.keys(adData).forEach(key => {
        formData.append(key, adData[key]);
      });
      formData.append('image', adImage);
      
      const response = await fetch(`${API_URL}/cashier/advertisements/${adId}/`, {
        method: 'PUT',
        body: formData,
      });
      return handleResponse(response);
    } else {
      const response = await fetch(`${API_URL}/cashier/advertisements/${adId}/`, {
        method: 'PUT',
        headers: getHeadersNoAuth(),
        body: JSON.stringify(adData),
      });
      return handleResponse(response);
    }
  },

  deleteAdvertisement: async (adId) => {
    const response = await fetch(`${API_URL}/cashier/advertisements/${adId}/`, {
      method: 'DELETE',
      headers: getHeadersNoAuth(),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return true;
  },
};

// Export all API services
export default {
  customer: customerApi,
  cashier: cashierApi
};