import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, CashierRoute, CustomerRoute } from "./components/ProtectedRoute";
import { CustomerRoute as NewCustomerRoute, CashierRoute as NewCashierRoute, ManagerRoute } from "./components/auth/ProtectedRoute";
import CustomerLogin from "./components/auth/CustomerLogin";
import CashierLogin from "./components/auth/CashierLogin";
import ManagerLogin from "./components/auth/ManagerLogin";
import CustomerRegister from "./components/auth/CustomerRegister";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import Signup from "./Signup";
import Login from "./Login";
import CustomerDashboard from "./CustomerDashboard";
import ManagerDashboard from "./ManagerDashboard";
import CashierDashboard from "./CashierDashboard";
import StoresPage from './StoresPage';
import TestAPI from './TestAPI';
import TestLogin from './TestLogin';
import DebugRoutes from './DebugRoutes';
import TestAuth from './components/TestAuth';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/customer/login" replace />} />
          
          {/* New JWT Authentication Routes */}
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route path="/cashier/login" element={<CashierLogin />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          
          {/* Password Reset Routes */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          
          {/* New Protected Dashboard Routes */}
          <Route 
            path="/customer/dashboard" 
            element={
              <NewCustomerRoute>
                <CustomerDashboard />
              </NewCustomerRoute>
            } 
          />
          
          <Route 
            path="/cashier/dashboard" 
            element={
              <NewCashierRoute>
                <CashierDashboard />
              </NewCashierRoute>
            } 
          />
          
          <Route 
            path="/manager/dashboard" 
            element={
              <ManagerRoute>
                <ManagerDashboard />
              </ManagerRoute>
            } 
          />
          
          {/* Legacy routes for backward compatibility */}
          <Route 
            path="/customer-dashboard" 
            element={<CustomerDashboard />}
          />
          
          <Route 
            path="/customer-dashboard-auth" 
            element={
              <CustomerRoute>
                <CustomerDashboard />
              </CustomerRoute>
            } 
          />
          
          <Route 
            path="/cashier-dashboard" 
            element={<CashierDashboard />}
          />
          
          <Route 
            path="/cashier-dashboard-auth" 
            element={
              <CashierRoute>
                <CashierDashboard />
              </CashierRoute>
            } 
          />
          
          <Route 
            path="/manager-dashboard" 
            element={<ManagerDashboard />}
          />
          
          <Route 
            path="/manager-dashboard-auth" 
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Alternative routes for easier access */}
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <ManagerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cashier" 
            element={
              <CashierRoute>
                <CashierDashboard />
              </CashierRoute>
            } 
          />
          
          <Route 
            path="/customer" 
            element={
              <CustomerRoute>
                <CustomerDashboard />
              </CustomerRoute>
            } 
          />
          
          {/* Other protected routes */}
          <Route 
            path="/stores" 
            element={
              <ProtectedRoute>
                <StoresPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/test-api" element={<TestAPI />} />
          <Route path="/test-login" element={<TestLogin />} />
          <Route path="/test-auth" element={<TestAuth />} />
          <Route path="/debug" element={<DebugRoutes />} />
          
          {/* Test routes without authentication - for development only */}
          <Route path="/test-manager" element={<ManagerDashboard />} />
          <Route path="/test-cashier" element={<CashierDashboard />} />
          <Route path="/test-customer" element={<CustomerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;