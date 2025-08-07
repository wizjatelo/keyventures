import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, Eye, EyeOff, ShoppingBag, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const ManagerLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // LineMart theme colors
  const theme = {
    colors: {
      primary: '#FF6B35',
      primaryLight: '#FF8A5B',
      primaryDark: '#E55A2B',
      background: '#F8F9FA',
      cardBg: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#E8EAED',
      success: '#27AE60',
      error: '#E74C3C',
      warning: '#F39C12',
      info: '#3498DB'
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.1)',
      md: '0 4px 12px rgba(0,0,0,0.1)',
      lg: '0 8px 24px rgba(0,0,0,0.15)',
      xl: '0 20px 40px rgba(0,0,0,0.1)'
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(formData.username, formData.password, 'manager');
      
      if (result.success) {
        setSuccess('Login successful! Redirecting to manager dashboard...');
        setTimeout(() => {
          navigate('/manager-dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.primaryLight}10 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.colors.primary}08 0%, transparent 50%), 
                         radial-gradient(circle at 75% 75%, ${theme.colors.primaryLight}08 0%, transparent 50%)`,
        zIndex: 0
      }} />

      <div style={{
        backgroundColor: theme.colors.cardBg,
        borderRadius: '1rem',
        boxShadow: theme.shadows.xl,
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 1,
        border: `1px solid ${theme.colors.border}`
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: `${theme.colors.primary}15`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            border: `3px solid ${theme.colors.primary}30`
          }}>
            <Shield size={36} color={theme.colors.primary} />
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: theme.colors.text,
            margin: '0 0 0.5rem',
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Manager Portal
          </h1>
          
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '1rem',
            margin: 0,
            lineHeight: 1.5
          }}>
            Administrative access to LineMart
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            backgroundColor: `${theme.colors.error}10`,
            border: `1px solid ${theme.colors.error}30`,
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} color={theme.colors.error} />
            <span style={{ color: theme.colors.error, fontSize: '0.875rem' }}>
              {error}
            </span>
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: `${theme.colors.success}10`,
            border: `1px solid ${theme.colors.success}30`,
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={18} color={theme.colors.success} />
            <span style={{ color: theme.colors.success, fontSize: '0.875rem' }}>
              {success}
            </span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: '0.5rem'
            }}>
              Manager Username
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={20} 
                color={theme.colors.textSecondary}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your manager username"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: theme.colors.text,
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                color={theme.colors.textSecondary}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 3rem 0.875rem 3rem',
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  padding: '0.25rem'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: theme.colors.textSecondary
            }}>
              <input
                type="checkbox"
                style={{
                  accentColor: theme.colors.primary,
                  width: '1rem',
                  height: '1rem'
                }}
              />
              Keep me signed in
            </label>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: loading ? theme.colors.textSecondary : theme.colors.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.colors.primaryDark;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = theme.shadows.md;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = theme.colors.primary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff40',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing in...
              </div>
            ) : (
              'Access Manager Dashboard'
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div style={{
          backgroundColor: `${theme.colors.warning}10`,
          border: `1px solid ${theme.colors.warning}30`,
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: theme.colors.warning,
            margin: '0 0 0.5rem'
          }}>
            🔐 High-Level Access
          </h4>
          <p style={{
            fontSize: '0.75rem',
            color: theme.colors.textSecondary,
            margin: 0,
            lineHeight: 1.4
          }}>
            This portal provides administrative access to all LineMart systems. All manager activities are logged and monitored.
          </p>
        </div>

        {/* Navigation Links */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '0.875rem',
            margin: '0 0 1rem'
          }}>
            Staff member?{' '}
            <Link
              to="/cashier-login"
              style={{
                color: theme.colors.primary,
                textDecoration: 'none',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Cashier Login
            </Link>
          </p>
          
          <Link
            to="/customer-dashboard"
            style={{
              color: theme.colors.textSecondary,
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
            onMouseEnter={(e) => e.target.style.color = theme.colors.primary}
            onMouseLeave={(e) => e.target.style.color = theme.colors.textSecondary}
          >
            ← Back to Customer Portal
          </Link>
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ManagerLogin;