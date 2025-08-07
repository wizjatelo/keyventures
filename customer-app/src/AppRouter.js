import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import CustomerDashboard from './App'; // Your main customer dashboard
import PaymentForm from './components/Payment/PaymentForm';
import PaymentHistory from './components/Payment/PaymentHistory';
import DeliveryTracking from './components/Delivery/DeliveryTracking';

const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } 
          />

          {/* Customer Dashboard - Allow both authenticated and guest access */}
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/customer-dashboard" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/customer-dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;