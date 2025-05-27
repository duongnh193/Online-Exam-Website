import React, { createContext, useState, useContext, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';

// Theme variables
const ThemeStyles = createGlobalStyle`
  :root {
    --transition-speed: 0.3s;
  }

  .light-theme {
    --bg-primary: #f8f9fa;
    --bg-secondary: #ffffff;
    --bg-sidebar: #6a00ff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #eeeeee;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    --highlight-color: #6a00ff;
    --input-bg: #ffffff;
    --hover-bg: #f5f5f5;
  }
  
  .dark-theme {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2a2a2a;
    --bg-sidebar: #3a3a3a;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #444444;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    --highlight-color: #8d47ff;
    --input-bg: #333333;
    --hover-bg: #404040;
  }
  
  body {
    transition: background-color var(--transition-speed) ease;
    margin: 0;
    padding: 0;
  }
  
  /* Smooth transitions for all elements */
  * {
    transition: background-color var(--transition-speed) ease,
                color var(--transition-speed) ease,
                border-color var(--transition-speed) ease,
                box-shadow var(--transition-speed) ease;
  }
`;

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    // You could also update a <meta> tag to change the theme color for mobile browsers
    // document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDarkMode ? '#1a1a1a' : '#f8f9fa');
  }, [isDarkMode]);

  // Value to be provided by the context
  const themeContextValue = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeStyles />
      <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 