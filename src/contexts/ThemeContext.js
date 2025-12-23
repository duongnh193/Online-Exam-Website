import React, { createContext, useState, useContext, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { BREAKPOINTS } from '../theme/tokens';

// Theme variables
const ThemeStyles = createGlobalStyle`
  :root {
    --transition-speed: 0.3s;
  }

  .light-theme {
    --bg-primary: #f8f9fa;
    --bg-secondary: #ffffff;
    --bg-sidebar: #4A4AFF;
    --text-primary: #1f2933;
    --text-secondary: #566274;
    --border-color: #e4e7ec;
    --card-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    --highlight-color: #4A4AFF;
    --input-bg: #ffffff;
    --hover-bg: rgba(74, 74, 255, 0.08);
    --sidebar-width: 240px;
  }
  
  .dark-theme {
    --bg-primary: #121826;
    --bg-secondary: #1f2937;
    --bg-sidebar: #2f3749;
    --text-primary: #f1f5f9;
    --text-secondary: #bcccdc;
    --border-color: #303749;
    --card-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    --highlight-color: #8d47ff;
    --input-bg: #2d3648;
    --hover-bg: rgba(141, 71, 255, 0.16);
    --sidebar-width: 240px;
  }
  
  @media (max-width: ${BREAKPOINTS.tablet}px) {
    .light-theme,
    .dark-theme {
      --sidebar-width: 72px;
    }
  }
  
  @media (max-width: ${BREAKPOINTS.mobile}px) {
    .light-theme,
    .dark-theme {
      --sidebar-width: 0px;
    }
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
