# LineMart Complete API Endpoints Documentation

## 🔐 Authentication Endpoints (All Implemented)

### Customer Authentication
- **POST** `/api/auth/customer/login/` - Customer login
- **POST** `/api/auth/customer/register/` - Customer registration

### Cashier Authentication  
- **POST** `/api/auth/cashier/login/` - Cashier login (requires cashier_key)

### Manager Authentication
- **POST** `/api/auth/manager/login/` - Manager login

### Common Authentication
- **POST** `/api/auth/logout/` - Logout (all roles)
- **POST** `/api/auth/password-reset/` - Password reset request
- **POST** `/api/auth/password-reset-confirm/<uid>/<token>/` - Password reset confirm

---

## 🏪 Cashier Dashboard Endpoints (All Implemented)

### Core Management
- **GET|POST** `/api/cashier/categories/` - Category management
- **GET|POST** `/api/cashier/subcategories/` - Subcategory management  
- **GET|POST** `/api/cashier/products/` - Product management
- **GET|POST** `/api/cashier/transactions/` - Transaction management
- **GET|POST** `/api/cashier/customers/` - Customer management

### Additional Features
- **GET|POST** `/api/cashier/stores/` - Store management
- **GET|POST** `/api/cashier/advertisements/` - Advertisement management
- **GET|POST** `/api/cashier/returns/` - Return/refund management

### Payment Management (NEW)
- **GET|POST** `/api/cashier/payments/` - Payment management
- **POST** `/api/cashier/payments/{id}/process_payment/` - Process payment status

### Delivery Management (NEW)
- **GET|POST** `/api/cashier/delivery-routes/` - Delivery route management
- **GET|POST** `/api/cashier/deliveries/` - Delivery management
- **POST** `/api/cashier/deliveries/{id}/update_status/` - Update delivery status
- **GET** `/api/cashier/deliveries/{id}/tracking_history/` - Get tracking history
- **GET|POST** `/api/cashier/delivery-updates/` - Delivery update logs

### Analytics & Reports
- **GET** `/api/cashier/dashboard/metrics/` - Dashboard analytics
- **GET** `/api/cashier/dashboard/sales/` - Sales data
- **GET** `/api/cashier/dashboard/inventory-alerts/` - Inventory alerts

---

## 👥 Customer Dashboard Endpoints (All Implemented)

### Product Browsing
- **GET** `/api/customer/categories/` - Browse categories
- **GET** `/api/customer/subcategories/` - Browse subcategories
- **GET** `/api/customer/products/` - Browse products
- **GET** `/api/customer/advertisements/` - View advertisements

### Order Management
- **GET** `/api/customer/orders/` - Order history
- **GET** `/api/customer/orders/{id}/` - Order details

### Search & Discovery
- **GET** `/api/customer/search/` - Product search
- **GET** `/api/customer/stores/` - Store information

### Payment System (NEW)
- **GET** `/api/customer/payments/` - Customer payment history
- **POST** `/api/customer/payments/` - Create payment for order
- **GET** `/api/customer/payments/{id}/` - Payment details

### Delivery Tracking (NEW)
- **GET** `/api/customer/deliveries/` - Customer deliveries
- **GET** `/api/customer/deliveries/{id}/` - Delivery details
- **GET** `/api/customer/deliveries/track_by_number/` - Track by tracking number
- **GET** `/api/customer/deliveries/{id}/tracking_history/` - Delivery tracking history

### Profile Management
- **GET|PUT** `/api/customer/profile/` - Customer profile
- **GET** `/api/customer/notifications/` - Customer notifications

---

## 👔 Manager Dashboard Endpoints (All Implemented)

### Dashboard & Analytics
- **GET** `/api/manager/dashboard/` - Manager dashboard overview
- **GET** `/api/manager/users/` - Staff user management
- **GET** `/api/manager/reports/` - Management reports

### Advanced Reports
- **GET** `/api/manager/reports/sales_report/` - Sales reporting
- **GET** `/api/manager/reports/inventory_report/` - Inventory reporting
- **GET** `/api/manager/reports/user_activity/` - User activity reports

---

## 🔒 Authentication Requirements

### All Endpoints Require Authentication Except:
- Authentication endpoints (`/api/auth/*`)
- Public product browsing (some customer endpoints allow guest access)

### Token-Based Authentication:
```javascript
// Headers required for authenticated requests
{
  'Authorization': 'Token <user_token>',
  'Content-Type': 'application/json'
}
```

### Role-Based Access Control:
- **Customer**: Access to customer endpoints only
- **Cashier**: Access to cashier endpoints + limited customer data
- **Manager**: Access to manager endpoints + cashier data
- **Admin**: Full access to all endpoints

---

## 📱 Frontend Integration Status

### Cashier App (`cashier-app/`)
✅ **Authentication Context** - Complete role-based auth
✅ **API Service** - All cashier endpoints implemented
✅ **Payment Management** - Process payments, update status
✅ **Delivery Management** - Create deliveries, update tracking
✅ **Real-time Updates** - Polling system for live data

### Customer App (`customer-app/`)
✅ **Authentication Context** - Customer-specific auth
✅ **API Service** - All customer endpoints implemented  
✅ **Payment System** - Create payments, view history
✅ **Delivery Tracking** - Track deliveries, view history
✅ **Real-time Updates** - Live product and order updates

---

## 🔄 Real-Time Features

### Payment Flow:
1. **Customer** creates payment via `/api/customer/payments/`
2. **Cashier** processes payment via `/api/cashier/payments/{id}/process_payment/`
3. **Customer** sees updated status in real-time

### Delivery Flow:
1. **Cashier** creates delivery via `/api/cashier/deliveries/`
2. **Cashier** updates delivery status via `/api/cashier/deliveries/{id}/update_status/`
3. **Customer** tracks delivery via `/api/customer/deliveries/track_by_number/`
4. **Customer** sees real-time tracking updates

---

## 🧪 API Testing

### Test Script Available:
```bash
python test_api_endpoints.py
```

### Manual Testing:
```bash
# Start Django server
cd backend
python manage.py runserver

# Test authentication
curl -X POST http://localhost:8000/api/auth/customer/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Test authenticated endpoint
curl -X GET http://localhost:8000/api/customer/products/ \
  -H "Authorization: Token <your_token>"
```

---

## 📊 Database Schema

### New Tables Added:
- **cashierdashboard_payment** - Payment records
- **cashierdashboard_deliveryroute** - Delivery routes
- **cashierdashboard_delivery** - Delivery records  
- **cashierdashboard_deliveryupdate** - Delivery tracking updates

### Relationships:
- Payment ↔ Transaction (OneToOne)
- Delivery ↔ Transaction (OneToOne)
- Delivery ↔ DeliveryRoute (ForeignKey)
- DeliveryUpdate ↔ Delivery (ForeignKey)

---

## 🚀 Production Ready Features

✅ **Complete Authentication System**
✅ **Role-Based Access Control**  
✅ **Payment Processing**
✅ **Delivery Tracking**
✅ **Real-Time Updates**
✅ **Error Handling**
✅ **Data Validation**
✅ **API Documentation**
✅ **Frontend Integration**
✅ **Database Migrations**

## 🎯 All Requirements Met

The LineMart system now includes:
1. ✅ **Payment System** - Complete payment processing for customers
2. ✅ **Delivery Tracking** - Full delivery management updated by cashiers
3. ✅ **Route Management** - Delivery routes managed by cashiers
4. ✅ **Real-Time Updates** - Live tracking visible to customers
5. ✅ **Authentication** - All endpoints properly secured
6. ✅ **Frontend Components** - React components for all features

**Status: FULLY IMPLEMENTED AND PRODUCTION READY** 🎉