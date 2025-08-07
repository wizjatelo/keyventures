import axios from 'axios';

// Create axios instance for manager API
const managerApi = axios.create({
  baseURL: 'http://localhost:8000/api/manager',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for authentication
managerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
managerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= MANAGER DASHBOARD API METHODS =============

export const managerApiService = {
  // Dashboard Metrics (using real API endpoint)
  async getDashboardMetrics(storeId = 'all') {
    try {
      const response = await managerApi.get('/manager-dashboard/dashboard_metrics/', {
        params: { store: storeId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return fallback mock data
      return {
        totalSales: 125000,
        totalOrders: 1234,
        activeStores: 4,
        totalCustomers: 5678,
        conversionRate: 3.2,
        avgOrderValue: 101.3,
        salesGrowth: 12.5,
        ordersGrowth: 8.3
      };
    }
  },

  // Notifications (using real API endpoint)
  async getNotifications() {
    try {
      const response = await managerApi.get('/manager-dashboard/notifications/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [
        { id: 1, type: 'warning', message: 'Low stock alert: Check inventory', time: '5 min ago' },
        { id: 2, type: 'success', message: 'Daily sales target exceeded', time: '15 min ago' },
        { id: 3, type: 'info', message: 'System update completed', time: '1 hour ago' }
      ];
    }
  },

  // Pending Approvals (using real API endpoint)
  async getPendingApprovals() {
    try {
      const response = await managerApi.get('/manager-dashboard/pending_approvals/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [
        { id: 1, type: 'Return', amount: 150, store: 'Downtown Flagship', time: '10 min ago' },
        { id: 2, type: 'Discount', amount: 50, store: 'Mall Outlet', time: '25 min ago' },
        { id: 3, type: 'Void Transaction', amount: 200, store: 'Airport Kiosk', time: '1 hour ago' }
      ];
    }
  },

  // Approve Request
  async approveRequest(id, type) {
    try {
      const response = await managerApi.post('/manager-dashboard/approve_request/', {
        id,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },

  // Reject Request
  async rejectRequest(id, type) {
    try {
      const response = await managerApi.post('/manager-dashboard/reject_request/', {
        id,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },

  // Sales Data (using real API endpoint)
  async getSalesData(period = 'weekly', storeId = 'all') {
    try {
      const response = await managerApi.get('/manager-dashboard/sales_data/', {
        params: { period, store: storeId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales data:', error);
      return [
        { name: 'Mon', sales: 4000, orders: 240 },
        { name: 'Tue', sales: 3000, orders: 198 },
        { name: 'Wed', sales: 2000, orders: 190 },
        { name: 'Thu', sales: 2780, orders: 218 },
        { name: 'Fri', sales: 1890, orders: 180 },
        { name: 'Sat', sales: 2390, orders: 195 },
        { name: 'Sun', sales: 3490, orders: 230 }
      ];
    }
  },

  // Store Performance (using real API endpoint)
  async getStorePerformance() {
    try {
      const response = await managerApi.get('/manager-dashboard/store_performance/');
      return response.data;
    } catch (error) {
      console.error('Error fetching store performance:', error);
      return [
        { name: 'Downtown Flagship', value: 35, color: '#FF6B35' },
        { name: 'Mall Outlet', value: 25, color: '#3498DB' },
        { name: 'Airport Kiosk', value: 20, color: '#27AE60' },
        { name: 'Online Store', value: 20, color: '#F39C12' }
      ];
    }
  },

  // Inventory Alerts (using real API endpoint)
  async getInventoryAlerts() {
    try {
      const response = await managerApi.get('/manager-dashboard/inventory_alerts/');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      return [
        { product: 'Sample Product', stock: 5, reorder: 20, status: 'low' }
      ];
    }
  },

  // Recent Orders (using real API endpoint)
  async getRecentOrders() {
    try {
      const response = await managerApi.get('/manager-dashboard/recent_orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      return [
        { id: '#ORD-001', customer: 'John Doe', amount: 250, status: 'pending', store: 'Downtown Flagship' },
        { id: '#ORD-002', customer: 'Jane Smith', amount: 180, status: 'completed', store: 'Mall Outlet' },
        { id: '#ORD-003', customer: 'Bob Johnson', amount: 320, status: 'processing', store: 'Airport Kiosk' }
      ];
    }
  },

  // Get Stores List (fallback to cashier API for now)
  async getStores() {
    try {
      const response = await axios.get('http://localhost:8000/api/cashier/stores/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  }
};

// ============= REAL-TIME DATA API METHODS =============

export const realTimeApiService = {
  // Product Updates (using manager real-time API)
  async getProductUpdates(since = null) {
    try {
      const response = await managerApi.get('/realtime-data/product_updates/', {
        params: since ? { since } : {}
      });
      return { products: response.data };
    } catch (error) {
      console.error('Error fetching product updates:', error);
      // Fallback to cashier API
      try {
        const response = await axios.get('http://localhost:8000/api/cashier/products/');
        return { products: response.data };
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  // Category Updates (using manager real-time API)
  async getCategoryUpdates() {
    try {
      const response = await managerApi.get('/realtime-data/category_updates/');
      return { categories: response.data };
    } catch (error) {
      console.error('Error fetching category updates:', error);
      // Fallback to cashier API
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          axios.get('http://localhost:8000/api/cashier/categories/'),
          axios.get('http://localhost:8000/api/cashier/subcategories/')
        ]);
        
        const categories = categoriesRes.data.map(category => ({
          ...category,
          subcategories: subcategoriesRes.data.filter(sub => sub.category === category.id)
        }));
        
        return { categories };
      } catch (fallbackError) {
        throw error;
      }
    }
  },

  // Inventory Status (using manager real-time API)
  async getInventoryStatus() {
    try {
      const response = await managerApi.get('/realtime-data/inventory_status/');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory status:', error);
      // Fallback to cashier API
      try {
        const response = await axios.get('http://localhost:8000/api/cashier/products/');
        const products = response.data;
        
        const lowStockProducts = products.filter(product => 
          product.stock <= (product.min_stock_level || 10)
        );
        
        return { 
          total_products: products.length,
          low_stock_count: lowStockProducts.length,
          low_stock_products: lowStockProducts
        };
      } catch (fallbackError) {
        throw error;
      }
    }
  }
};

// ============= REAL-TIME POLLING UTILITIES =============

export class RealTimeDataManager {
  constructor() {
    this.intervals = new Map();
    this.callbacks = new Map();
  }

  // Start polling for specific data type
  startPolling(dataType, callback, intervalMs = 30000) {
    // Stop existing polling for this data type
    this.stopPolling(dataType);

    // Store callback
    this.callbacks.set(dataType, callback);

    // Start polling
    const pollFunction = async () => {
      try {
        let data;
        switch (dataType) {
          case 'dashboard_metrics':
            data = await managerApiService.getDashboardMetrics();
            break;
          case 'notifications':
            data = await managerApiService.getNotifications();
            break;
          case 'pending_approvals':
            data = await managerApiService.getPendingApprovals();
            break;
          case 'inventory_alerts':
            data = await managerApiService.getInventoryAlerts();
            break;
          case 'recent_orders':
            data = await managerApiService.getRecentOrders();
            break;
          case 'product_updates':
            data = await realTimeApiService.getProductUpdates();
            break;
          case 'inventory_status':
            data = await realTimeApiService.getInventoryStatus();
            break;
          default:
            console.warn(`Unknown data type: ${dataType}`);
            return;
        }
        
        callback(data);
      } catch (error) {
        console.error(`Error polling ${dataType}:`, error);
        // Continue polling even on error
      }
    };

    // Initial fetch
    pollFunction();

    // Set up interval
    const intervalId = setInterval(pollFunction, intervalMs);
    this.intervals.set(dataType, intervalId);

    console.log(`Started polling for ${dataType} every ${intervalMs}ms`);
  }

  // Stop polling for specific data type
  stopPolling(dataType) {
    const intervalId = this.intervals.get(dataType);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(dataType);
      this.callbacks.delete(dataType);
      console.log(`Stopped polling for ${dataType}`);
    }
  }

  // Stop all polling
  stopAllPolling() {
    for (const [dataType] of this.intervals) {
      this.stopPolling(dataType);
    }
  }

  // Get current polling status
  getPollingStatus() {
    const status = {};
    for (const [dataType] of this.intervals) {
      status[dataType] = 'active';
    }
    return status;
  }
}

// Create singleton instance
export const realTimeManager = new RealTimeDataManager();

// ============= WEBSOCKET INTEGRATION (Future Enhancement) =============

export class WebSocketManager {
  constructor() {
    this.ws = null;
    this.callbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(url = 'ws://localhost:8000/ws/dashboard/') {
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const callback = this.callbacks.get(data.type);
          if (callback) {
            callback(data.payload);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  subscribe(dataType, callback) {
    this.callbacks.set(dataType, callback);
  }

  unsubscribe(dataType) {
    this.callbacks.delete(dataType);
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.callbacks.clear();
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager();

export default managerApiService;