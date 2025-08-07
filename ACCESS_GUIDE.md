# 🚀 LineMart Dashboard Access Guide

## 🎯 **How to Access the Dashboards**

### **Option 1: Direct Test Routes (No Authentication Required)**
These routes bypass authentication for testing purposes:

- **Manager Dashboard**: http://localhost:3001/test-manager
- **Cashier Dashboard**: http://localhost:3001/test-cashier  
- **Customer Dashboard**: http://localhost:3001/test-customer

### **Option 2: Test Login Page**
Use the test login page with pre-configured accounts:

- **Test Login Page**: http://localhost:3001/test-login

**Available Test Accounts:**
- **Manager Account**: 
  - Username: `manager1`
  - Email: `manager@linemart.com`
  - Role: `manager`
  - Access: `/manager` or `/manager-dashboard`

- **Cashier Account**:
  - Username: `cashier1` 
  - Email: `cashier@linemart.com`
  - Role: `cashier`
  - Access: `/cashier` or `/cashier-dashboard`

### **Option 3: Alternative Short Routes**
After authentication, you can also use these shorter routes:

- **Manager**: http://localhost:3001/manager
- **Cashier**: http://localhost:3001/cashier
- **Customer**: http://localhost:3001/customer

---

## 🧪 **Testing the Real-Time Integration**

### **Step 1: Start the System**
```bash
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2 - Frontend  
cd linemart-frontend
npm start
```

### **Step 2: Access Dashboards**
1. **Manager Dashboard**: http://localhost:3001/test-manager
2. **Cashier Dashboard**: http://localhost:3001/test-cashier
3. **Customer Dashboard**: http://localhost:3001/test-customer

### **Step 3: Test Real-Time Flow**
1. Open **Cashier Dashboard** → Add/edit a product
2. Open **Manager Dashboard** → See metrics update in 30 seconds
3. Open **Customer Dashboard** → See product appear in 8 seconds
4. Check **Inventory Alerts** → Low stock items trigger notifications

---

## 🔧 **Troubleshooting**

### **If you can't access the manager dashboard:**
1. Try the direct test route: http://localhost:3001/test-manager
2. Use the test login page: http://localhost:3001/test-login
3. Check that both backend and frontend are running
4. Verify the backend is accessible: http://localhost:8000/api/manager/manager-dashboard/dashboard_metrics/

### **If you see authentication errors:**
1. Use the test routes that bypass authentication
2. Clear browser localStorage: `localStorage.clear()`
3. Try the test login page with pre-configured accounts

### **If data doesn't load:**
1. Check backend is running on port 8000
2. Verify API endpoints: http://localhost:8000/api/cashier/products/
3. Check browser console for error messages
4. Ensure CORS is configured properly

---

## 📊 **What You Should See**

### **Manager Dashboard Features:**
- ✅ Real-time business metrics ($2,295 total sales, 10 orders)
- ✅ Live inventory alerts (Google Pixel 8: 5 units, Sony WH-1000XM5: 3 units)
- ✅ Dynamic notifications based on stock levels
- ✅ Sales analytics charts
- ✅ Store performance data
- ✅ Pending approvals (returns, discounts)

### **Cashier Dashboard Features:**
- ✅ Product management (CRUD operations)
- ✅ Category and subcategory management
- ✅ Image upload functionality
- ✅ Stock level updates
- ✅ Real-time data broadcasting

### **Customer Dashboard Features:**
- ✅ Live product catalog
- ✅ Category filtering
- ✅ Real-time price and stock updates
- ✅ Shopping cart functionality
- ✅ Responsive design

---

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **Manager Dashboard**: Live metrics showing $2,295 in sales, 10 orders, and inventory alerts
2. **Cashier Dashboard**: Ability to add/edit products with immediate database updates
3. **Customer Dashboard**: Products displaying with real-time updates
4. **Real-Time Flow**: Changes in cashier dashboard appear in manager and customer dashboards
5. **API Responses**: All endpoints returning 200 status with real data

---

## 🔗 **Quick Access Links**

- **Manager Dashboard (Direct)**: http://localhost:3001/test-manager
- **Cashier Dashboard (Direct)**: http://localhost:3001/test-cashier
- **Customer Dashboard (Direct)**: http://localhost:3001/test-customer
- **Test Login Page**: http://localhost:3001/test-login
- **Integration Test Page**: Open `test_integration_simple.html` in browser
- **API Health Check**: http://localhost:8000/api/cashier/categories/

**🚀 The LineMart real-time integration system is ready for testing!**