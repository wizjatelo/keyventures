import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createTheme, roleThemes, commonStyles } from '../../theme/appTheme';
import { User, Lock, Key, Eye, EyeOff, CreditCard, Shield, Users } from 'lucide-react';
// import './Auth.css';

const CashierLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    cashier_key: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const { cashierLogin } = useAuth();
  const navigate = useNavigate();
  
  // Create theme
  const theme = createTheme(darkMode);
  const roleTheme = roleThemes.CASHIER;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await cashierLogin(formData);
      
      if (response.redirect_to) {
        navigate(response.redirect_to);
      } else {
        navigate('/cashier/dashboard');
      }
    } catch (error) {
      console.error('Cashier login error:', error);
      setError(error.message || 'Login failed. Please check your credentials and cashier key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: theme.gradients.background,
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${roleTheme.primary}15 0%, transparent 50%)`,
        animation: 'float 25s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        ...commonStyles.card(theme),
        width: '100%',
        maxWidth: '520px',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: roleTheme.gradient,
            marginBottom: '24px',
            boxShadow: theme.shadows.lg
          }}>
            <CreditCard size={36} color="white" />
          </div>
          
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '8px', 
            fontSize: '32px', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Cashier Access
          </h1>
          
          <p style={{ 
            color: theme.colors.textSecondary, 
            marginBottom: '24px', 
            fontSize: '18px',
            fontWeight: '400'
          }}>
            Point-of-sale system login
          </p>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: `${roleTheme.primary}20`,
            color: roleTheme.primary,
            border: `2px solid ${roleTheme.primary}30`
          }}>
            <Users size={16} />
            <span>Staff Portal</span>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
          {error && (
            <div style={{
              background: `${theme.colors.error}15`,
              color: theme.colors.error,
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: `2px solid ${theme.colors.error}30`,
              fontSize: '15px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Shield size={20} />
              {error}
            </div>
          )}

          {/* Username Field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>Username or Email</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textSecondary,
                  zIndex: 1
                }}
              />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username or email"
                disabled={isLoading}
                style={{
                  ...commonStyles.input(theme),
                  paddingLeft: '48px',
                  opacity: isLoading ? 0.6 : 1
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textSecondary,
                  zIndex: 1
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                disabled={isLoading}
                style={{
                  ...commonStyles.input(theme),
                  paddingLeft: '48px',
                  paddingRight: '48px',
                  opacity: isLoading ? 0.6 : 1
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Cashier Key Field */}
          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="cashier_key" style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>Cashier Secret Key</label>
            <div style={{ position: 'relative' }}>
              <Key 
                size={20} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: roleTheme.primary,
                  zIndex: 1
                }}
              />
              <input
                type={showKey ? "text" : "password"}
                id="cashier_key"
                name="cashier_key"
                value={formData.cashier_key}
                onChange={handleChange}
                required
                placeholder="Enter your cashier secret key"
                disabled={isLoading}
                style={{
                  ...commonStyles.input(theme),
                  paddingLeft: '48px',
                  paddingRight: '48px',
                  opacity: isLoading ? 0.6 : 1,
                  borderColor: formData.cashier_key ? roleTheme.primary : theme.colors.border
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  padding: '4px'
                }}
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div style={{
              marginTop: '8px',
              padding: '12px 16px',
              background: `${roleTheme.primary}10`,
              borderRadius: '8px',
              border: `1px solid ${roleTheme.primary}30`,
              fontSize: '13px',
              color: theme.colors.textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Shield size={16} color={roleTheme.primary} />
              This key was provided when your cashier account was created
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              ...commonStyles.button.primary(theme),
              width: '100%',
              background: isLoading ? theme.colors.textSecondary : roleTheme.gradient,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              padding: '18px'
            }}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Accessing System...
              </div>
            ) : (
              'Access POS System'
            )}
          </button>
        </form>

        {/* Links Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/forgot-password" style={{
            color: theme.colors.textSecondary,
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '15px',
            transition: 'all 0.3s ease'
          }}>
            Forgot your password?
          </Link>
          
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: `${theme.colors.warning}15`,
            borderRadius: '12px',
            border: `1px solid ${theme.colors.warning}30`,
            fontSize: '14px',
            color: theme.colors.warning,
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Shield size={16} />
            Cashier accounts require admin approval
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          background: `${roleTheme.primary}08`,
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '24px',
          border: `1px solid ${roleTheme.primary}20`
        }}>
          <h4 style={{
            marginBottom: '16px',
            color: theme.colors.text,
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CreditCard size={18} color={roleTheme.primary} />
            Cashier Privileges
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {[
              { icon: '📋', text: 'View & manage orders', available: true },
              { icon: '🔄', text: 'Update order status', available: true },
              { icon: '💳', text: 'Process payments', available: true },
              { icon: '📦', text: 'Check product stock', available: true },
              { icon: '👥', text: 'User management', available: false }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0',
                fontSize: '14px',
                color: feature.available ? theme.colors.success : theme.colors.textSecondary,
                fontWeight: '500'
              }}>
                <span style={{ fontSize: '16px' }}>{feature.icon}</span>
                <span>{feature.available ? '✓' : '✗'}</span>
                <span>{feature.text}</span>
                {!feature.available && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: theme.colors.textSecondary,
                    fontStyle: 'italic'
                  }}>
                    (manager only)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Role Switch Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          paddingTop: '24px',
          borderTop: `1px solid ${theme.colors.border}`
        }}>
          <Link to="/customer/login" style={{
            ...commonStyles.button.secondary(theme),
            padding: '8px 16px',
            fontSize: '13px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ← Customer Portal
          </Link>
          <Link to="/manager/login" style={{
            ...commonStyles.button.secondary(theme),
            padding: '8px 16px',
            fontSize: '13px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Manager Access →
          </Link>
        </div>

        {/* Dark Mode Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '24px'
        }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '25px',
              padding: '8px 16px',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CashierLogin;