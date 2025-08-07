import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ShoppingBag, AlertCircle, CheckCircle, Phone, UserCheck } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Account Details

  const { register } = useAuth();
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

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
      });
      
      if (result.success) {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/customer-dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
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
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = theme.colors.primary;
    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = theme.colors.border;
    e.target.style.boxShadow = 'none';
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
        maxWidth: '480px',
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
            <ShoppingBag size={36} color={theme.colors.primary} />
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
            Join LineMart
          </h1>
          
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '1rem',
            margin: 0,
            lineHeight: 1.5
          }}>
            Create your account to start shopping
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            backgroundColor: theme.colors.primary,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            1
          </div>
          <div style={{
            flex: 1,
            height: '2px',
            backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.border,
            transition: 'background-color 0.3s ease'
          }} />
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            backgroundColor: step >= 2 ? theme.colors.primary : theme.colors.border,
            color: step >= 2 ? '#FFFFFF' : theme.colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            2
          </div>
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

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Personal Information
              </h3>

              {/* First Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '0.5rem'
                }}>
                  First Name
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
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    required
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '0.5rem'
                }}>
                  Last Name
                </label>
                <div style={{ position: 'relative' }}>
                  <UserCheck 
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
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    required
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail 
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
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '0.5rem'
                }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone 
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
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: theme.colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.primaryDark;
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = theme.shadows.md;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.primary;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Account Details
              </h3>

              {/* Username */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '0.5rem'
                }}>
                  Username
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
                    placeholder="Choose a username"
                    required
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>
              </div>

              {/* Password */}
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
                    placeholder="Create a password"
                    required
                    style={{
                      ...inputStyle,
                      paddingRight: '3rem'
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
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

              {/* Confirm Password */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.colors.text,
                  marginBottom: '0.5rem'
                }}>
                  Confirm Password
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    style={{
                      ...inputStyle,
                      paddingRight: '3rem'
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: 'transparent',
                    color: theme.colors.textSecondary,
                    border: `2px solid ${theme.colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = theme.colors.primary;
                    e.target.style.color = theme.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = theme.colors.border;
                    e.target.style.color = theme.colors.textSecondary;
                  }}
                >
                  ← Back
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    padding: '0.875rem',
                    backgroundColor: loading ? theme.colors.textSecondary : theme.colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
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
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Sign In Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: '0.875rem',
            margin: 0
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: theme.colors.primary,
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Sign in here
            </Link>
          </p>
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

export default Signup;