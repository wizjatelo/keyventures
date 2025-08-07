# 🚀 LineMart Multi-Port Authentication System

## **🎯 System Architecture**

LineMart now runs as **4 separate applications** with **complete user isolation**:

- **Backend API**: Port 8000 (Centralized data)
- **Customer Portal**: Port 3001 (Public-facing)
- **Cashier Portal**: Port 3002 (Staff only)
- **Manager Portal**: Port 3003 (Management only)

## **🔐 Authentication System**

### **Complete User Isolation**
- **Customers** cannot see cashier or manager users
- **Cashiers** cannot see manager or customer data
- **Managers** have oversight but through separate interface
- Each role has **separate login endpoints**

### **Authentication Endpoints**
- **Customer Login**: `POST /api/auth/customer/login/`
- **Cashier Login**: `POST /api/auth/cashier/login/`
- **Manager Login**: `POST /api/auth/manager/login/`
- **Customer Register**: `POST /api/auth/customer/register/`

## **🚀 Quick Start**

### **1. Install Dependencies**
```bash
# Run this once to install all dependencies
install-dependencies.bat
```

### **2. Start All Applications**
```bash
# Starts all 4 applications simultaneously
start-all-apps.bat
```

### **3. Access the Portals**

| Portal | URL | Test Credentials |
|--------|-----|------------------|
| **Customer** | http://localhost:3001 | Register new account or browse as guest |
| **Cashier** | http://localhost:3002 | Username: `cashier1`, Password: `password123` |
| **Manager** | http://localhost:3003 | Username: `manager1`, Password: `password123` |
| **Backend API** | http://localhost:8000 | API endpoints |

## **👥 User Management**

### **Customer Portal (Port 3001)**
- **Public Access**: Browse products without login
- **Registration**: Create customer accounts
- **Features**: Shopping cart, product browsing, real-time updates
- **Isolation**: Cannot see staff or management data

### **Cashier Portal (Port 3002)**
- **Staff Only**: Requires cashier authentication
- **Features**: Product management, inventory, sales processing
- **Permissions**: CRUD operations on products and categories
- **Isolation**: Cannot access management reports or customer data

### **Manager Portal (Port 3003)**
- **Management Only**: Requires manager authentication
- **Features**: Dashboard analytics, inventory alerts, store management
- **Permissions**: Full oversight and reporting
- **Isolation**: Separate interface from staff operations

## **🔄 Real-Time Data Flow**

```
Customer (3001) ←→ Backend API (8000) ←→ Cashier (3002)
                        ↕
                 Manager (3003)
```

- **Customer updates**: 8-second polling
- **Cashier updates**: 15-second polling
- **Manager updates**: 30-second polling
- **Cross-portal sync**: Changes propagate across all portals

## **🛡️ Security Features**

### **Role-Based Authentication**
- Separate JWT tokens for each role
- Role-specific API endpoints
- Permission-based data access

### **Data Isolation**
- Customers see only public product data
- Cashiers see only operational data
- Managers see aggregated analytics
- No cross-role data leakage

### **Session Management**
- Independent sessions per portal
- Role-specific localStorage keys
- Secure token handling

## **🧪 Testing the System**

### **Test User Isolation**
1. **Open Customer Portal** (3001) - Browse products as guest
2. **Open Cashier Portal** (3002) - Login with cashier credentials
3. **Open Manager Portal** (3003) - Login with manager credentials
4. **Verify**: Each portal shows different interfaces and data

### **Test Real-Time Updates**
1. **Cashier Portal**: Add/edit a product
2. **Customer Portal**: See product appear in 8 seconds
3. **Manager Portal**: See inventory metrics update in 30 seconds

### **Test Authentication**
1. Try accessing cashier portal without login → Blocked
2. Try accessing manager portal without login → Blocked
3. Customer portal works without login for browsing

## **📊 Features by Portal**

### **Customer Portal Features**
- ✅ Product browsing and search
- ✅ Category filtering
- ✅ Shopping cart functionality
- ✅ Real-time product updates
- ✅ Guest browsing + optional registration
- ✅ Responsive design

### **Cashier Portal Features**
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Inventory tracking
- ✅ Image upload
- ✅ Stock management
- ✅ Real-time data broadcasting

### **Manager Portal Features**
- ✅ Business analytics dashboard
- ✅ Sales metrics and charts
- ✅ Inventory alerts
- ✅ Store performance tracking
- ✅ Real-time notifications
- ✅ Multi-store management

## **🔧 Development**

### **Adding New Features**
- **Customer features**: Edit `customer-app/src/App.js`
- **Cashier features**: Edit `cashier-app/src/App.js`
- **Manager features**: Edit `manager-app/src/App.js`
- **Backend APIs**: Edit respective Django apps

### **Database Changes**
```bash
cd backend
venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate
```

### **Port Configuration**
- Customer: `customer-app/package.json` → `"start": "PORT=3001 react-scripts start"`
- Cashier: `cashier-app/package.json` → `"start": "PORT=3002 react-scripts start"`
- Manager: `manager-app/package.json` → `"start": "PORT=3003 react-scripts start"`

## **🎉 Success Indicators**

When everything is working correctly:

1. **4 separate browser tabs** can be opened simultaneously
2. **Different interfaces** for each role
3. **Independent authentication** for each portal
4. **Real-time data sync** across all portals
5. **Complete user isolation** - no cross-role data visibility

## **🚨 Troubleshooting**

### **Port Conflicts**
- Ensure ports 3001, 3002, 3003, 8000 are available
- Kill existing processes if needed

### **Authentication Issues**
- Clear browser localStorage for each portal
- Use correct test credentials for each role
- Check backend API is running on port 8000

### **Real-Time Updates Not Working**
- Verify backend API endpoints are accessible
- Check browser console for CORS errors
- Ensure all applications are running

---

## **🎯 Quick Access Summary**

| What | Where | How |
|------|-------|-----|
| **Start Everything** | Root directory | Run `start-all-apps.bat` |
| **Customer Shopping** | http://localhost:3001 | Browse as guest or register |
| **Cashier Operations** | http://localhost:3002 | Login: cashier1/password123 |
| **Manager Analytics** | http://localhost:3003 | Login: manager1/password123 |
| **API Testing** | http://localhost:8000 | Direct API access |

**🚀 The LineMart multi-port authentication system is now fully operational with complete user isolation!**