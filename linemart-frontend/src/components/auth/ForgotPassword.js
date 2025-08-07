import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createTheme, roleThemes, commonStyles } from '../../theme/appTheme';
import { Mail, ArrowLeft, Shield, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { authApi } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Create theme
  const theme = createTheme(darkMode);
  const roleTheme = roleThemes.CUSTOMER;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authApi.requestPasswordReset(email);
      setIsSuccess(true);
      setMessage(response.message || 'Password reset instructions have been sent to your email address.');
    } catch (error) {
      console.error('Password reset request error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await authApi.requestPasswordReset(email);
      setMessage('Password reset instructions have been resent to your email address.');
    } catch (error) {
      console.error('Password reset resend error:', error);
      setError(error.message || 'Failed to resend password reset email. Please try again.');
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
        maxWidth: '480px',
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
            <Shield size={36} color="white" />
          </div>
          
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '8px', 
            fontSize: '32px', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            {isSuccess ? 'Check Your Email' : 'Reset Password'}
          </h1>
          
          <p style={{ 
            color: theme.colors.textSecondary, 
            marginBottom: '24px', 
            fontSize: '18px',
            fontWeight: '400'
          }}>
            {isSuccess 
              ? 'We\'ve sent password reset instructions to your email'
              : 'Enter your email address to receive reset instructions'
            }
          </p>
        </div>

        {!isSuccess ? (
          <>
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
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div style={{ marginBottom: '32px' }}>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading || !email}
                style={{
                  ...commonStyles.button.primary(theme),
                  width: '100%',
                  background: isLoading ? theme.colors.textSecondary : roleTheme.gradient,
                  opacity: isLoading || !email ? 0.7 : 1,
                  cursor: isLoading || !email ? 'not-allowed' : 'pointer',
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
                    Sending Instructions...
                  </div>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success Section */}
            <div style={{
              background: `${theme.colors.success}15`,
              color: theme.colors.success,
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '32px',
              border: `2px solid ${theme.colors.success}30`,
              fontSize: '15px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              textAlign: 'left'
            }}>
              <CheckCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                  Email Sent Successfully!
                </div>
                <div style={{ lineHeight: '1.5' }}>
                  {message}
                </div>
                <div style={{ 
                  marginTop: '12px', 
                  fontSize: '14px', 
                  color: theme.colors.textSecondary 
                }}>
                  Didn't receive the email? Check your spam folder or click resend below.
                </div>
              </div>
            </div>

            {/* Resend Button */}
            <button 
              onClick={handleResend}
              disabled={isLoading}
              style={{
                ...commonStyles.button.secondary(theme),
                width: '100%',
                marginBottom: '24px',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Resending...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <RefreshCw size={16} />
                  Resend Email
                </div>
              )}
            </button>
          </>
        )}

        {/* Back to Login Link */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/customer/login" style={{
            color: theme.colors.textSecondary,
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '16px',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>

        {/* Help Section */}
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
            Need Help?
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              lineHeight: '1.5'
            }}>
              • Make sure to check your spam/junk folder
            </div>
            <div style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              lineHeight: '1.5'
            }}>
              • Reset links expire after 24 hours for security
            </div>
            <div style={{
              fontSize: '14px',
              color: theme.colors.textSecondary,
              lineHeight: '1.5'
            }}>
              • Contact support if you continue having issues
            </div>
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

export default ForgotPassword;