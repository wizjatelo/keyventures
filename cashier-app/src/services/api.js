// Cashier API Service
const API_BASE_URL = 'http://localhost:8000/api';

class CashierApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('cashier_token');
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

  // Categories
  async getCategories() {
    return await this.apiCall('/cashier/categories/');
  }

  async createCategory(categoryData) {
    return await this.apiCall('/cashier/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(categoryId, categoryData) {
    return await this.apiCall(`/cashier/categories/${categoryId}/`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(categoryId) {
    return await this.apiCall(`/cashier/categories/${categoryId}/`, {
      method: 'DELETE'
    });
  }

  // Subcategories
  async getSubcategories(categoryId = null) {
    const endpoint = categoryId 
      ? `/cashier/subcategories/?category=${categoryId}`
      : '/cashier/subcategories/';
    return await this.apiCall(endpoint);
  }

  async createSubcategory(subcategoryData) {
    return await this.apiCall('/cashier/subcategories/', {
      method: 'POST',
      body: JSON.stringify(subcategoryData)
    });
  }

  async updateSubcategory(subcategoryId, subcategoryData) {
    return await this.apiCall(`/cashier/subcategories/${subcategoryId}/`, {
      method: 'PUT',
      body: JSON.stringify(subcategoryData)
    });
  }

  async deleteSubcategory(subcategoryId) {
    return await this.apiCall(`/cashier/subcategories/${subcategoryId}/`, {
      method: 'DELETE'
    });
  }

  // Products
  async getProducts(search = '', subcategoryId = null) {
    let endpoint = '/cashier/products/';
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (subcategoryId) params.append('subcategory', subcategoryId);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.apiCall(endpoint);
  }

  async createProduct(productData) {
    // Handle file upload
    if (productData instanceof FormData) {
      const token = localStorage.getItem('cashier_token');
      const response = await fetch(`${this.baseURL}/cashier/products/`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Token ${token}` })
        },
        body: productData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    }

    return await this.apiCall('/cashier/products/', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(productId, productData) {
    // Handle file upload
    if (productData instanceof FormData) {
      const token = localStorage.getItem('cashier_token');
      const response = await fetch(`${this.baseURL}/cashier/products/${productId}/`, {
        method: 'PUT',
        headers: {
          ...(token && { 'Authorization': `Token ${token}` })
        },
        body: productData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    }

    return await this.apiCall(`/cashier/products/${productId}/`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(productId) {
    return await this.apiCall(`/cashier/products/${productId}/`, {
      method: 'DELETE'
    });
  }

  // Transactions
  async getTransactions(filters = {}) {
    let endpoint = '/cashier/transactions/';
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.apiCall(endpoint);
  }

  async createTransaction(transactionData) {
    return await this.apiCall('/cashier/transactions/', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  async getTransaction(transactionId) {
    return await this.apiCall(`/cashier/transactions/${transactionId}/`);
  }

  // Returns
  async createReturn(returnData) {
    return await this.apiCall('/cashier/returns/', {
      method: 'POST',
      body: JSON.stringify(returnData)
    });
  }

  async getReturns() {
    return await this.apiCall('/cashier/returns/');
  }

  // Customers
  async getCustomers(search = '') {
    const endpoint = search 
      ? `/cashier/customers/?search=${encodeURIComponent(search)}`
      : '/cashier/customers/';
    return await this.apiCall(endpoint);
  }

  async createCustomer(customerData) {
    return await this.apiCall('/cashier/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async updateCustomer(customerId, customerData) {
    return await this.apiCall(`/cashier/customers/${customerId}/`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  }

  // Advertisements
  async getAdvertisements() {
    return await this.apiCall('/cashier/advertisements/');
  }

  async createAdvertisement(adData) {
    // Handle file upload
    if (adData instanceof FormData) {
      const token = localStorage.getItem('cashier_token');
      const response = await fetch(`${this.baseURL}/cashier/advertisements/`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Token ${token}` })
        },
        body: adData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    }

    return await this.apiCall('/cashier/advertisements/', {
      method: 'POST',
      body: JSON.stringify(adData)
    });
  }

  // Dashboard Analytics
  async getDashboardMetrics() {
    return await this.apiCall('/cashier/dashboard/metrics/');
  }

  async getSalesData(period = 'week') {
    return await this.apiCall(`/cashier/dashboard/sales/?period=${period}`);
  }

  async getInventoryAlerts() {
    return await this.apiCall('/cashier/dashboard/inventory-alerts/');
  }

  // Store Management
  async getStores() {
    return await this.apiCall('/cashier/stores/');
  }

  async getStoreDetails(storeId) {
    return await this.apiCall(`/cashier/stores/${storeId}/`);
  }

  // Payments
  async getPayments() {
    return await this.apiCall('/cashier/payments/');
  }

  async createPayment(paymentData) {
    return await this.apiCall('/cashier/payments/', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getPayment(paymentId) {
    return await this.apiCall(`/cashier/payments/${paymentId}/`);
  }

  async processPayment(paymentId, statusData) {
    return await this.apiCall(`/cashier/payments/${paymentId}/process_payment/`, {
      method: 'POST',
      body: JSON.stringify(statusData)
    });
  }

  // Delivery Routes
  async getDeliveryRoutes() {
    return await this.apiCall('/cashier/delivery-routes/');
  }

  async createDeliveryRoute(routeData) {
    return await this.apiCall('/cashier/delivery-routes/', {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  }

  async updateDeliveryRoute(routeId, routeData) {
    return await this.apiCall(`/cashier/delivery-routes/${routeId}/`, {
      method: 'PUT',
      body: JSON.stringify(routeData)
    });
  }

  async deleteDeliveryRoute(routeId) {
    return await this.apiCall(`/cashier/delivery-routes/${routeId}/`, {
      method: 'DELETE'
    });
  }

  // Deliveries
  async getDeliveries(status = null) {
    let endpoint = '/cashier/deliveries/';
    if (status) {
      endpoint += `?status=${status}`;
    }
    return await this.apiCall(endpoint);
  }

  async createDelivery(deliveryData) {
    return await this.apiCall('/cashier/deliveries/', {
      method: 'POST',
      body: JSON.stringify(deliveryData)
    });
  }

  async getDelivery(deliveryId) {
    return await this.apiCall(`/cashier/deliveries/${deliveryId}/`);
  }

  async updateDeliveryStatus(deliveryId, statusData) {
    return await this.apiCall(`/cashier/deliveries/${deliveryId}/update_status/`, {
      method: 'POST',
      body: JSON.stringify(statusData)
    });
  }

  async getDeliveryTrackingHistory(deliveryId) {
    return await this.apiCall(`/cashier/deliveries/${deliveryId}/tracking_history/`);
  }

  // Delivery Updates
  async createDeliveryUpdate(updateData) {
    return await this.apiCall('/cashier/delivery-updates/', {
      method: 'POST',
      body: JSON.stringify(updateData)
    });
  }
}

// Create and export singleton instance
export const cashierApi = new CashierApiService();

// Export class for testing or custom instances
export default CashierApiService;