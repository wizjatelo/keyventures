import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createTheme, roleThemes, commonStyles } from '../../theme/appTheme';
import { User, Mail, Lock, Eye, EyeOff, ShoppingCart, Shield, CheckCircle, XCircle, Star } from 'lucide-react';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const { customerRegister } = useAuth();
  const navigate = useNavigate();
  
  // Create theme
  const theme = createTheme(darkMode);
  const roleTheme = roleThemes.CUSTOMER;

  // Password policy validation
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate password in real-time
    if (name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password policy
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      setError('Please fix the password requirements below');
      setIsLoading(false);
      return;
    }

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      const response = await customerRegister(registrationData);
      
      if (response.redirect_to) {
        navigate(response.redirect_to);
      } else {
        navigate('/customer/dashboard');
      }
    } catch (error) {
      console.error('Customer registration error:', error);
      
      // Handle specific error types
      if (error.message.includes('password_errors')) {
        const errorData = JSON.parse(error.message);
        setPasswordErrors(errorData.password_errors || []);
        setError('Password does not meet security requirements');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
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
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `radial-gradient(circle, ${roleTheme.primary}15 0%, transparent 50%)`,
        animation: 'float 20s ease-in-out infinite',
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
            <ShoppingCart size={36} color="white" />
          </div>
          
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '8px', 
            fontSize: '32px', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Join LineMart
          </h1>
          
          <p style={{ 
            color: theme.colors.textSecondary, 
            marginBottom: '24px', 
            fontSize: '18px',
            fontWeight: '400'
          }}>
            Create your shopping account
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
            <User size={16} />
            <span>Customer Registration</span>
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
            }}>Username</label>
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
                placeholder="Choose a username"
                disabled={isLoading}
                style={{
                  ...commonStyles.input(theme),
                  paddingLeft: '48px',
                  opacity: isLoading ? 0.6 : 1
                }}
              />
            </div>
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail 
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
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
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
                placeholder="Create a strong password"
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
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  height: '4px',
                  background: theme.colors.border,
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    height: '100%',
                    width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                    background: passwordStrength === 'weak' ? theme.colors.error : passwordStrength === 'medium' ? theme.colors.warning : theme.colors.success,
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: passwordStrength === 'weak' ? theme.colors.error : passwordStrength === 'medium' ? theme.colors.warning : theme.colors.success
                }}>
                  Password strength: {passwordStrength}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>Confirm Password</label>
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
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading || passwordErrors.length > 0}
            style={{
              ...commonStyles.button.primary(theme),
              width: '100%',
              background: isLoading ? theme.colors.textSecondary : roleTheme.gradient,
              opacity: isLoading || passwordErrors.length > 0 ? 0.7 : 1,
              cursor: isLoading || passwordErrors.length > 0 ? 'not-allowed' : 'pointer',
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
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Links Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ 
            marginBottom: '16px', 
            color: theme.colors.textSecondary, 
            fontSize: '16px',
            fontWeight: '400'
          }}>
            Already have an account? 
            <Link to="/customer/login" style={{
              color: roleTheme.primary,
              textDecoration: 'none',
              fontWeight: '600',
              marginLeft: '8px',
              transition: 'all 0.3s ease'
            }}>
              Sign in here
            </Link>
          </p>
        </div>

        {/* Password Requirements Section */}
        <div style={{
          background: `${theme.colors.info}08`,
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '24px',
          border: `1px solid ${theme.colors.info}20`
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
            <Shield size={18} color={theme.colors.info} />
            Password Requirements
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {[
              { text: 'At least 8 characters', check: formData.password.length >= 8 },
              { text: 'One uppercase letter', check: /[A-Z]/.test(formData.password) },
              { text: 'One number', check: /[0-9]/.test(formData.password) },
              { text: 'One special character', check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
            ].map((requirement, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0',
                fontSize: '14px',
                color: requirement.check ? theme.colors.success : theme.colors.textSecondary,
                fontWeight: '500'
              }}>
                {requirement.check ? <CheckCircle size={16} /> : <XCircle size={16} />}
                <span>{requirement.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Benefits Section */}
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
            <Star size={18} color={roleTheme.primary} />
            Customer Benefits
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {[
              { icon: '🛍️', text: 'Browse & shop products', available: true },
              { icon: '🛒', text: 'Add items to cart', available: true },
              { icon: '👤', text: 'Manage your profile', available: true },
              { icon: '📦', text: 'Track order history', available: true },
              { icon: '💳', text: 'Secure payments', available: true }
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0',
                fontSize: '14px',
                color: theme.colors.success,
                fontWeight: '500'
              }}>
                <span style={{ fontSize: '16px' }}>{feature.icon}</span>
                <span>✓</span>
                <span>{feature.text}</span>
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
          <Link to="/cashier/login" style={{
            ...commonStyles.button.secondary(theme),
            padding: '8px 16px',
            fontSize: '13px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Staff Login →
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
            Manager Portal →
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

export default CustomerRegister;