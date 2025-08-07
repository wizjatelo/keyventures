// LineMart Application Theme
export const createTheme = (darkMode = false) => ({
  colors: {
    primary: darkMode ? '#FF8A5B' : '#FF6B35',
    primaryLight: darkMode ? '#E55A2B' : '#FF8A5B',
    primaryDark: darkMode ? '#FF6B35' : '#E55A2B',
    background: darkMode ? '#2C3E50' : '#F8F9FA',
    cardBg: darkMode ? '#34495E' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#2C3E50',
    textSecondary: darkMode ? '#BDC3C7' : '#7F8C8D',
    border: darkMode ? '#34495E' : '#E8EAED',
    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB'
  },
  shadows: {
    sm: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
    md: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
    lg: darkMode ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.15)'
  },
  gradients: {
    primary: darkMode 
      ? 'linear-gradient(135deg, #FF8A5B 0%, #E55A2B 100%)'
      : 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    background: darkMode
      ? 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)'
      : 'linear-gradient(135deg, #F8F9FA 0%, #E8EAED 100%)',
    card: darkMode
      ? 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)'
      : 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)'
  }
});

// Role-specific color schemes
export const roleThemes = {
  CUSTOMER: {
    primary: '#FF6B35',
    secondary: '#FF8A5B',
    accent: '#E55A2B',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)'
  },
  CASHIER: {
    primary: '#3498DB',
    secondary: '#5DADE2',
    accent: '#2980B9',
    gradient: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)'
  },
  MANAGER: {
    primary: '#9B59B6',
    secondary: '#BB8FCE',
    accent: '#8E44AD',
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)'
  }
};

// Common component styles
export const commonStyles = {
  button: {
    primary: (theme) => ({
      background: theme.gradients.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '12px',
      padding: '14px 28px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: theme.shadows.md,
      textTransform: 'none',
      letterSpacing: '0.5px'
    }),
    secondary: (theme) => ({
      background: 'transparent',
      color: theme.colors.textSecondary,
      border: `2px solid ${theme.colors.border}`,
      borderRadius: '12px',
      padding: '14px 28px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    })
  },
  input: (theme) => ({
    width: '100%',
    padding: '16px 20px',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: theme.colors.cardBg,
    color: theme.colors.text,
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    outline: 'none'
  }),
  card: (theme) => ({
    background: theme.gradients.card,
    borderRadius: '20px',
    boxShadow: theme.shadows.lg,
    padding: '40px',
    border: `1px solid ${theme.colors.border}`
  })
};