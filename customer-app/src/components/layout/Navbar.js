import React, { useState } from 'react';
import { 
  Search, ShoppingCart, Bell, User, LogIn, UserPlus, 
  Menu, X, ChevronDown, Shield, Package, CreditCard, 
  UserCheck, Eye, EyeOff 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ 
  searchQuery, 
  setSearchQuery, 
  showCart, 
  setShowCart, 
  getCartItemCount, 
  showNotifications, 
  setShowNotifications, 
  unreadNotificationsCount,
  theme,
  styles 
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [showBenefits, setShowBenefits] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const customerBenefits = [
    { 
      icon: '🛍️', 
      text: 'Browse & shop products', 
      available: true, 
      description: 'Access our full product catalog' 
    },
    { 
      icon: '🛒', 
      text: 'Add items to cart', 
      available: true, 
      description: 'Save items for later purchase' 
    },
    { 
      icon: '👤', 
      text: 'Manage your profile', 
      available: isAuthenticated(), 
      description: isAuthenticated() ? 'Update personal information' : 'Login to manage profile',
      requiresAuth: true 
    },
    { 
      icon: '📦', 
      text: 'Track order history', 
      available: isAuthenticated(), 
      description: isAuthenticated() ? 'View all your past orders' : 'Login to view order history',
      requiresAuth: true 
    },
    { 
      icon: '💳', 
      text: 'Secure payments', 
      available: isAuthenticated(), 
      description: isAuthenticated() ? 'Safe and secure checkout' : 'Login for secure payments',
      requiresAuth: true 
    }
  ];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log('Auth form submitted:', authForm);
    setShowAuthModal(false);
  };

  const handleInputChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <header style={{
        ...styles.header,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Left Section - Logo & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: 'white',
            cursor: 'pointer'
          }}>
            LineMart
          </div>
          
          <div style={{
            ...styles.searchBar,
            maxWidth: '400px',
            flex: 1
          }}>
            <Search size={18} color={theme.colors.textSecondary} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, orders..."
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Center Section - Customer Benefits */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowBenefits(!showBenefits)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <Shield size={16} />
            Customer Benefits
            <ChevronDown size={16} />
          </button>

          {/* Benefits Dropdown */}
          {showBenefits && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              background: theme.colors.cardBg,
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${theme.colors.border}`,
              padding: '16px',
              minWidth: '320px',
              zIndex: 1001
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                color: theme.colors.text,
                fontSize: '16px',
                fontWeight: '700'
              }}>
                Customer Benefits
              </h4>
              
              {customerBenefits.map((benefit, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: index < customerBenefits.length - 1 ? `1px solid ${theme.colors.border}` : 'none'
                }}>
                  <span style={{ fontSize: '20px' }}>{benefit.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        color: benefit.available ? theme.colors.success : theme.colors.textSecondary,
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {benefit.available ? '✓' : '🔒'}
                      </span>
                      <span style={{
                        color: benefit.available ? theme.colors.text : theme.colors.textSecondary,
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        {benefit.text}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: theme.colors.textSecondary,
                      fontStyle: 'italic'
                    }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {!isAuthenticated() && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: `${theme.colors.info}15`,
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.info}30`,
                  textAlign: 'center'
                }}>
                  <p style={{
                    margin: '0 0 8px 0',
                    color: theme.colors.info,
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Unlock all benefits!
                  </p>
                  <button
                    onClick={() => {
                      setShowBenefits(false);
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    style={{
                      background: theme.colors.info,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Login Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Auth & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Cart Button */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '0.5rem'
              }}
              onClick={() => setShowCart(!showCart)}
            >
              <ShoppingCart size={22} color="#FFF" />
              {getCartItemCount() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '0.5rem'
              }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={22} color="#FFF" />
              {unreadNotificationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>

          {/* Authentication Section */}
          {isAuthenticated() ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={18} color="white" />
              </div>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                {user?.first_name || user?.username || 'User'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LogIn size={14} />
                Login
              </button>
              
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                style={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UserPlus size={14} />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: theme.colors.cardBg,
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '400px',
            margin: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                margin: 0,
                color: theme.colors.text,
                fontSize: '24px',
                fontWeight: '700'
              }}>
                {authMode === 'login' ? 'Welcome Back!' : 'Join LineMart'}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: theme.colors.textSecondary
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: theme.colors.text,
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: theme.colors.background
                    }}
                    placeholder="Enter your email"
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: theme.colors.text,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={authForm.username}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: theme.colors.background
                  }}
                  placeholder="Enter your username"
                />
              </div>

              <div style={{ marginBottom: authMode === 'signup' ? '16px' : '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  color: theme.colors.text,
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={authForm.password}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '40px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: theme.colors.background
                    }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    color: theme.colors.text,
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={authForm.confirmPassword}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: theme.colors.background
                    }}
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Switch Auth Mode */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showBenefits || showNotifications) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => {
            setShowBenefits(false);
            setShowNotifications(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;