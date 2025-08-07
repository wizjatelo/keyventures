import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createTheme, roleThemes, commonStyles } from '../../theme/appTheme';
import { Lock, Eye, EyeOff, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/api';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

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

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid or missing reset token');
        setIsVerifying(false);
        return;
      }

      try {
        await authApi.verifyResetToken(token);
        setTokenValid(true);
      } catch (error) {
        console.error('Token verification error:', error);
        setError(error.message || 'Invalid or expired reset token');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

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
      await authApi.resetPassword(token, formData.password);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/customer/login');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.gradients.background,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          ...commonStyles.card(theme),
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${theme.colors.border}`,
            borderTop: `3px solid ${roleTheme.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: theme.colors.text, fontSize: '16px' }}>
            Verifying reset token...
          </p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.gradients.background,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          ...commonStyles.card(theme),
          textAlign: 'center',
          maxWidth: '480px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: `${theme.colors.error}20`,
            marginBottom: '24px'
          }}>
            <AlertCircle size={36} color={theme.colors.error} />
          </div>
          
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '16px', 
            fontSize: '24px', 
            fontWeight: '700'
          }}>
            Invalid Reset Link
          </h1>
          
          <p style={{ 
            color: theme.colors.textSecondary, 
            marginBottom: '32px', 
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            {error}
          </p>

          <Link to="/forgot-password" style={{
            ...commonStyles.button.primary(theme),
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '16px'
          }}>
            Request New Reset Link
          </Link>

          <div>
            <Link to="/customer/login" style={{
              color: theme.colors.textSecondary,
              textDecoration: 'none',
              fontSize: '14px'
            }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.gradients.background,
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          ...commonStyles.card(theme),
          textAlign: 'center',
          maxWidth: '480px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: `${theme.colors.success}20`,
            marginBottom: '24px'
          }}>
            <CheckCircle size={36} color={theme.colors.success} />
          </div>
          
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '16px', 
            fontSize: '24px', 
            fontWeight: '700'
          }}>
            Password Reset Successful!
          </h1>
          
          <p style={{ 
            color: theme.colors.textSecondary, 
            marginBottom: '32px', 
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Your password has been successfully reset. You will be redirected to the login page in a few seconds.
          </p>

          <Link to="/customer/login" style={{
            ...commonStyles.button.primary(theme),
            textDecoration: 'none',
            display: 'inline-block'
          }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
            <Lock size={36} color="white" />
          </div>
          
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '8px', 
            fontSize: '32px', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Set New Password
          </h1>
          
          <p style={{ 
            color: theme.colors.textSecondary, 
            marginBottom: '24px', 
            fontSize: '18px',
            fontWeight: '400'
          }}>
            Choose a strong password for your account
          </p>
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

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>New Password</label>
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
                placeholder="Enter your new password"
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
            }}>Confirm New Password</label>
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
                placeholder="Confirm your new password"
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
                Resetting Password...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

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

        {/* Back to Login Link */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link to="/customer/login" style={{
            color: theme.colors.textSecondary,
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}>
            Back to Login
          </Link>
        </div>

        {/* Dark Mode Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
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

export default ResetPassword;