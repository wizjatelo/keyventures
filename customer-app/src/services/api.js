// Customer API Service
const API_BASE_URL = 'http://localhost:8000/api';

class CustomerApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('customer_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` })
    };
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {};
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Products (Read-only for customers)
  async getProducts(search = '', categoryId = null) {
    let endpoint = '/customer/products/';
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (categoryId) params.append('category', categoryId);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.apiCall(endpoint);
  }

  async getProduct(productId) {
    return await this.apiCall(`/customer/products/${productId}/`);
  }

  // Categories (Read-only for customers)
  async getCategories() {
    return await this.apiCall('/customer/categories/');
  }

  async getCategory(categoryId) {
    return await this.apiCall(`/customer/categories/${categoryId}/`);
  }

  // Subcategories (Read-only for customers)
  async getSubcategories(categoryId = null) {
    const endpoint = categoryId 
      ? `/customer/subcategories/?category=${categoryId}`
      : '/customer/subcategories/';
    return await this.apiCall(endpoint);
  }

  // Orders (Customer-specific)
  async getOrders() {
    return await this.apiCall('/customer/orders/');
  }

  async getOrder(orderId) {
    return await this.apiCall(`/customer/orders/${orderId}/`);
  }

  async createOrder(orderData) {
    return await this.apiCall('/customer/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async cancelOrder(orderId) {
    return await this.apiCall(`/customer/orders/${orderId}/cancel/`, {
      method: 'POST'
    });
  }

  // Cart (Customer-specific)
  async getCart() {
    return await this.apiCall('/customer/cart/');
  }

  async addToCart(productId, quantity = 1) {
    return await this.apiCall('/customer/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity })
    });
  }

  async updateCartItem(cartItemId, quantity) {
    return await this.apiCall(`/customer/cart/items/${cartItemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(cartItemId) {
    return await this.apiCall(`/customer/cart/items/${cartItemId}/`, {
      method: 'DELETE'
    });
  }

  async clearCart() {
    return await this.apiCall('/customer/cart/clear/', {
      method: 'POST'
    });
  }

  // Wishlist (Customer-specific)
  async getWishlist() {
    return await this.apiCall('/customer/wishlist/');
  }

  async addToWishlist(productId) {
    return await this.apiCall('/customer/wishlist/add/', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId })
    });
  }

  async removeFromWishlist(productId) {
    return await this.apiCall(`/customer/wishlist/remove/${productId}/`, {
      method: 'DELETE'
    });
  }

  // Reviews (Customer-specific)
  async getProductReviews(productId) {
    return await this.apiCall(`/customer/products/${productId}/reviews/`);
  }

  async createReview(productId, reviewData) {
    return await this.apiCall(`/customer/products/${productId}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async updateReview(reviewId, reviewData) {
    return await this.apiCall(`/customer/reviews/${reviewId}/`, {
      method: 'PUT',
      body: JSON.stringify(reviewData)
    });
  }

  async deleteReview(reviewId) {
    return await this.apiCall(`/customer/reviews/${reviewId}/`, {
      method: 'DELETE'
    });
  }

  // Promotions and Deals
  async getPromotions() {
    return await this.apiCall('/customer/promotions/');
  }

  async getDeals() {
    return await this.apiCall('/customer/deals/');
  }

  // Advertisements (Read-only for customers)
  async getAdvertisements() {
    return await this.apiCall('/customer/advertisements/');
  }

  // Customer Profile
  async getProfile() {
    return await this.apiCall('/customer/profile/');
  }

  async updateProfile(profileData) {
    return await this.apiCall('/customer/profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Loyalty Points
  async getLoyaltyPoints() {
    return await this.apiCall('/customer/loyalty/points/');
  }

  async getLoyaltyHistory() {
    return await this.apiCall('/customer/loyalty/history/');
  }

  // Notifications
  async getNotifications() {
    return await this.apiCall('/customer/notifications/');
  }

  async markNotificationAsRead(notificationId) {
    return await this.apiCall(`/customer/notifications/${notificationId}/read/`, {
      method: 'POST'
    });
  }

  async markAllNotificationsAsRead() {
    return await this.apiCall('/customer/notifications/read-all/', {
      method: 'POST'
    });
  }

  // Search
  async search(query, filters = {}) {
    let endpoint = '/customer/search/';
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.apiCall(endpoint);
  }

  // Store Information
  async getStores() {
    return await this.apiCall('/customer/stores/');
  }

  async getStore(storeId) {
    return await this.apiCall(`/customer/stores/${storeId}/`);
  }

  // Payments
  async getPayments() {
    return await this.apiCall('/customer/payments/');
  }

  async createPayment(paymentData) {
    return await this.apiCall('/customer/payments/', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getPayment(paymentId) {
    return await this.apiCall(`/customer/payments/${paymentId}/`);
  }

  // Delivery Tracking
  async getDeliveries() {
    return await this.apiCall('/customer/deliveries/');
  }

  async getDelivery(deliveryId) {
    return await this.apiCall(`/customer/deliveries/${deliveryId}/`);
  }

  async trackDeliveryByNumber(trackingNumber) {
    return await this.apiCall(`/customer/deliveries/track_by_number/?tracking_number=${trackingNumber}`);
  }

  async getDeliveryTrackingHistory(deliveryId) {
    return await this.apiCall(`/customer/deliveries/${deliveryId}/tracking_history/`);
  }
}

// Fallback to cashier API for products if customer endpoints don't exist yet
class FallbackApiService extends CustomerApiService {
  async getProducts(search = '', categoryId = null) {
    try {
      return await super.getProducts(search, categoryId);
    } catch (error) {
      // Fallback to cashier API
      console.log('Falling back to cashier API for products');
      let endpoint = '/cashier/products/';
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (categoryId) params.append('category', categoryId);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      return await this.apiCall(endpoint);
    }
  }

  async getCategories() {
    try {
      return await super.getCategories();
    } catch (error) {
      // Fallback to cashier API
      console.log('Falling back to cashier API for categories');
      return await this.apiCall('/cashier/categories/');
    }
  }

  async getAdvertisements() {
    try {
      return await super.getAdvertisements();
    } catch (error) {
      // Fallback to cashier API
      console.log('Falling back to cashier API for advertisements');
      return await this.apiCall('/cashier/advertisements/');
    }
  }
}

// Create and export singleton instance with fallback
export const cashierApi = new FallbackApiService();
export const customerApi = new CustomerApiService();

// Export class for testing or custom instances
export default CustomerApiService;