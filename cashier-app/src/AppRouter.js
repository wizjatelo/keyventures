import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CashierLogin from './components/Auth/Login';
import ManagerLogin from './components/Auth/ManagerLogin';
import CashierDashboard from './App'; // Your main cashier dashboard

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
                <CashierLogin />
              </ProtectedRoute>
            } 
          />

          {/* Manager Login */}
          <Route 
            path="/manager-login" 
            element={
              <ProtectedRoute requireAuth={false}>
                <ManagerLogin />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes - Require Cashier/Manager Authentication */}
          <Route 
            path="/cashier-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['cashier', 'manager']}>
                <CashierDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Manager-only Routes */}
          <Route 
            path="/manager-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <CashierDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;