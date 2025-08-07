// Real-time API service for cross-dashboard communication
const API_BASE_URL = 'http://localhost:8000/api';

class RealTimeApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('cashier_token') || 
                  localStorage.getItem('manager_token') || 
                  localStorage.getItem('customer_token');
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

  // Get product updates for real-time sync
  async getProductUpdates() {
    return await this.apiCall('/cashier/products/');
  }

  // Get category updates for real-time sync
  async getCategoryUpdates() {
    return await this.apiCall('/cashier/categories/');
  }

  // Get transaction updates
  async getTransactionUpdates() {
    return await this.apiCall('/cashier/transactions/');
  }

  // Get inventory alerts
  async getInventoryAlerts() {
    return await this.apiCall('/cashier/dashboard/inventory-alerts/');
  }

  // Get dashboard metrics
  async getDashboardMetrics() {
    return await this.apiCall('/manager/manager-dashboard/dashboard_metrics/');
  }

  // Get sales data
  async getSalesData() {
    return await this.apiCall('/manager/manager-dashboard/sales_data/');
  }

  // Get store performance
  async getStorePerformance() {
    return await this.apiCall('/manager/manager-dashboard/store_performance/');
  }

  // Get notifications
  async getNotifications() {
    return await this.apiCall('/manager/manager-dashboard/notifications/');
  }
}

// Real-time polling manager
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
          case 'transaction_updates':
            data = { transactions: await this.apiService.getTransactionUpdates() };
            break;
          case 'inventory_alerts':
            data = { alerts: await this.apiService.getInventoryAlerts() };
            break;
          case 'dashboard_metrics':
            data = await this.apiService.getDashboardMetrics();
            break;
          case 'sales_data':
            data = { sales_data: await this.apiService.getSalesData() };
            break;
          case 'store_performance':
            data = { store_performance: await this.apiService.getStorePerformance() };
            break;
          case 'notifications':
            data = { notifications: await this.apiService.getNotifications() };
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

    console.log(`🔄 Started polling for ${dataType} every ${intervalMs}ms`);
  }

  // Stop polling for a specific data type
  stopPolling(dataType) {
    const intervalId = this.intervals.get(dataType);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(dataType);
      console.log(`⏹️ Stopped polling for ${dataType}`);
    }
  }

  // Stop all polling
  stopAllPolling() {
    this.intervals.forEach((intervalId, dataType) => {
      clearInterval(intervalId);
      console.log(`⏹️ Stopped polling for ${dataType}`);
    });
    this.intervals.clear();
    console.log('🛑 All polling stopped');
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