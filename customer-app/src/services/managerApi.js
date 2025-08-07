// Real-time API service for cross-dashboard communication (Customer version)
const API_BASE_URL = 'http://localhost:8000/api';

class RealTimeApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('customer_token') || 
                  localStorage.getItem('cashier_token') || 
                  localStorage.getItem('manager_token');
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

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {};
    } catch (error) {
      console.error(`Real-time API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get product updates for real-time sync (customer view)
  async getProductUpdates() {
    try {
      return await this.apiCall('/customer/products/');
    } catch (error) {
      // Fallback to cashier API
      return await this.apiCall('/cashier/products/');
    }
  }

  // Get category updates for real-time sync (customer view)
  async getCategoryUpdates() {
    try {
      return await this.apiCall('/customer/categories/');
    } catch (error) {
      // Fallback to cashier API
      return await this.apiCall('/cashier/categories/');
    }
  }

  // Get promotions and deals
  async getPromotions() {
    try {
      return await this.apiCall('/customer/promotions/');
    } catch (error) {
      console.warn('Promotions endpoint not available');
      return [];
    }
  }

  async getDeals() {
    try {
      return await this.apiCall('/customer/deals/');
    } catch (error) {
      console.warn('Deals endpoint not available');
      return [];
    }
  }

  // Get advertisements
  async getAdvertisements() {
    try {
      return await this.apiCall('/customer/advertisements/');
    } catch (error) {
      // Fallback to cashier API
      return await this.apiCall('/cashier/advertisements/');
    }
  }

  // Get customer notifications
  async getNotifications() {
    try {
      return await this.apiCall('/customer/notifications/');
    } catch (error) {
      console.warn('Notifications endpoint not available');
      return [];
    }
  }

  // Get customer orders
  async getOrders() {
    try {
      return await this.apiCall('/customer/orders/');
    } catch (error) {
      console.warn('Orders endpoint not available');
      return [];
    }
  }

  // Get customer cart
  async getCart() {
    try {
      return await this.apiCall('/customer/cart/');
    } catch (error) {
      console.warn('Cart endpoint not available');
      return { items: [], total: 0 };
    }
  }
}

// Real-time polling manager for customer dashboard
class RealTimeManager {
  constructor() {
    this.intervals = new Map();
    this.apiService = new RealTimeApiService();
  }

  // Start polling for a specific data type
  startPolling(dataType, callback, intervalMs = 30000) {
    // Stop existing polling for this data type
    this.stopPolling(dataType);

    const pollFunction = async () => {
      try {
        let data;
        switch (dataType) {
          case 'product_updates':
            data = { products: await this.apiService.getProductUpdates() };
            break;
          case 'category_updates':
            data = { categories: await this.apiService.getCategoryUpdates() };
            break;
          case 'promotions':
            data = { promotions: await this.apiService.getPromotions() };
            break;
          case 'deals':
            data = { deals: await this.apiService.getDeals() };
            break;
          case 'advertisements':
            data = { advertisements: await this.apiService.getAdvertisements() };
            break;
          case 'notifications':
            data = { notifications: await this.apiService.getNotifications() };
            break;
          case 'orders':
            data = { orders: await this.apiService.getOrders() };
            break;
          case 'cart':
            data = { cart: await this.apiService.getCart() };
            break;
          default:
            console.warn(`Unknown data type for polling: ${dataType}`);
            return;
        }

        callback(data);
      } catch (error) {
        console.error(`Polling error for ${dataType}:`, error);
        // Continue polling even if there's an error
      }
    };

    // Initial call
    pollFunction();

    // Set up interval
    const intervalId = setInterval(pollFunction, intervalMs);
    this.intervals.set(dataType, intervalId);

    console.log(`🔄 Customer Dashboard: Started polling for ${dataType} every ${intervalMs}ms`);
  }

  // Stop polling for a specific data type
  stopPolling(dataType) {
    const intervalId = this.intervals.get(dataType);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(dataType);
      console.log(`⏹️ Customer Dashboard: Stopped polling for ${dataType}`);
    }
  }

  // Stop all polling
  stopAllPolling() {
    this.intervals.forEach((intervalId, dataType) => {
      clearInterval(intervalId);
      console.log(`⏹️ Customer Dashboard: Stopped polling for ${dataType}`);
    });
    this.intervals.clear();
    console.log('🛑 Customer Dashboard: All polling stopped');
  }

  // Get active polling types
  getActivePolling() {
    return Array.from(this.intervals.keys());
  }
}

// Create singleton instances
export const realTimeApiService = new RealTimeApiService();
export const realTimeManager = new RealTimeManager();

// Export classes for custom instances
export { RealTimeApiService, RealTimeManager };