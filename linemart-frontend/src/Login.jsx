import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { createTheme, roleThemes, commonStyles } from "./theme/appTheme";
import { User, Lock, Key, Eye, EyeOff, ShoppingCart, CreditCard, Crown, Shield } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [cashierKey, setCashierKey] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Create theme
  const theme = createTheme(darkMode);
  const roleTheme = roleThemes[role.toUpperCase()] || roleThemes.CUSTOMER;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (user?.role === 'cashier' ? '/cashier-dashboard' : '/customer-dashboard');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const credentials = {
      username,
      password,
    };

    if (role === "cashier") {
      credentials.cashier_key = cashierKey;
    }

    try {
      const result = await login(credentials, role);
      
      if (result.success) {
        // Redirect to intended page or default dashboard
        const from = location.state?.from?.pathname || (role === 'cashier' ? '/cashier-dashboard' : '/customer-dashboard');
        navigate(from, { replace: true });
      } else {
        setError(result.error || "Login failed.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://127.0.0.1:8000/accounts/${provider}/login/?process=login`;
  };

  const handleGuestAccess = () => {
    navigate('/customer-dashboard');
  };

  // Get role icon
  const getRoleIcon = () => {
    switch(role) {
      case 'customer': return <ShoppingCart size={36} color="white" />;
      case 'cashier': return <CreditCard size={36} color="white" />;
      case 'manager': return <Crown size={36} color="white" />;
      default: return <User size={36} color="white" />;
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
        top: '-40%',
        left: '-40%',
        width: '180%',
        height: '180%',
        background: `radial-gradient(circle, ${roleTheme.primary}12 0%, transparent 50%)`,
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
            boxShadow: theme.shadows.lg,
            transition: 'all 0.3s ease'
          }}>
            {getRoleIcon()}
          </div>
          
          <h1 style={{ 
            color: theme.colors.text, 
            marginBottom: '8px', 
            fontSize: '32px', 
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Welcome to LineMart
          </h1>
          
          <p style={{ 
            color: theme.colors.textSecondary, 
            marginBottom: '24px', 
            fontSize: '18px',
            fontWeight: '400'
          }}>
            Choose your role and sign in
          </p>
        </div>

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

        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
          {/* Role Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '16px'
            }}>
              Select Your Role:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { value: 'customer', label: 'Customer', icon: '🛍️', color: roleThemes.CUSTOMER.primary },
                { value: 'cashier', label: 'Cashier', icon: '💳', color: roleThemes.CASHIER.primary },
                { value: 'manager', label: 'Manager', icon: '👑', color: roleThemes.MANAGER.primary }
              ].map((roleOption) => (
                <button
                  key={roleOption.value}
                  type="button"
                  onClick={() => setRole(roleOption.value)}
                  style={{
                    padding: '16px 12px',
                    border: `2px solid ${role === roleOption.value ? roleOption.color : theme.colors.border}`,
                    borderRadius: '12px',
                    background: role === roleOption.value ? `${roleOption.color}15` : theme.colors.cardBg,
                    color: role === roleOption.value ? roleOption.color : theme.colors.text,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{roleOption.icon}</div>
                  {roleOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Username Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>
              Username or Email
            </label>
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
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                style={{
                  ...commonStyles.input(theme),
                  paddingLeft: '48px',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: role === 'cashier' ? '24px' : '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: '15px'
            }}>
              Password
            </label>
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{
                  ...commonStyles.input(theme),
                  paddingLeft: '48px',
                  paddingRight: '48px',
                  opacity: loading ? 0.6 : 1
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

          {/* Cashier Key Field - Only show for cashier role */}
          {role === "cashier" && (
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: theme.colors.text,
                fontWeight: '600',
                fontSize: '15px'
              }}>
                Cashier Secret Key
              </label>
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
                  placeholder="Enter your cashier secret key"
                  value={cashierKey}
                  onChange={(e) => setCashierKey(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    ...commonStyles.input(theme),
                    paddingLeft: '48px',
                    paddingRight: '48px',
                    opacity: loading ? 0.6 : 1,
                    borderColor: cashierKey ? roleTheme.primary : theme.colors.border
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
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...commonStyles.button.primary(theme),
              width: '100%',
              background: loading ? theme.colors.textSecondary : roleTheme.gradient,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              padding: '18px',
              marginBottom: '24px'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing In...
              </div>
            ) : (
              `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
            )}
          </button>
        </form>

        {/* Links Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: theme.colors.textSecondary, fontSize: '15px' }}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                style={{ 
                  color: roleTheme.primary, 
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Sign up here
              </Link>
            </span>
          </div>

          {role === 'customer' && (
            <button
              onClick={handleGuestAccess}
              style={{ 
                background: 'none',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                padding: '8px 16px',
                color: theme.colors.textSecondary, 
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🛍️ Continue as guest (browse only)
            </button>
          )}
        </div>

        {/* OAuth Section */}
        <div style={{ 
          borderTop: `1px solid ${theme.colors.border}`, 
          paddingTop: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '16px',
            color: theme.colors.textSecondary,
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Or continue with
          </div>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <button
              onClick={() => handleOAuthLogin("google")}
              style={{
                ...commonStyles.button.secondary(theme),
                width: '100%',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: '500'
              }}
            >
              <span style={{ fontSize: '18px' }}>🔍</span>
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthLogin("facebook")}
              style={{
                ...commonStyles.button.secondary(theme),
                width: '100%',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '15px',
                fontWeight: '500'
              }}
            >
              <span style={{ fontSize: '18px' }}>📘</span>
              Continue with Facebook
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Link 
            to="/forgot-password" 
            style={{ 
              color: theme.colors.textSecondary, 
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            Forgot Password?
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

export default Login;