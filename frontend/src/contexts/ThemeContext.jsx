import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    console.log('🎨 Initial theme from localStorage:', savedTheme); // Debug log
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('🎨 Using system preference: dark');
      return 'dark';
    }
    
    console.log('🎨 Defaulting to light theme');
    return 'light';
  });

  useEffect(() => {
    console.log('🎨 Theme changed to:', theme); // Debug log
    
    // Apply theme to document
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('✅ Added dark class to html');
    } else {
      root.classList.remove('dark');
      console.log('✅ Removed dark class from html');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    console.log('💾 Saved theme to localStorage:', theme);
  }, [theme]);

  const toggleTheme = () => {
    console.log('🔄 Toggle theme called. Current:', theme);
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      console.log('🔄 Toggling to:', newTheme);
      return newTheme;
    });
  };

  const setLightTheme = () => {
    console.log('☀️ Setting light theme');
    setTheme('light');
  };
  
  const setDarkTheme = () => {
    console.log('🌙 Setting dark theme');
    setTheme('dark');
  };

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}