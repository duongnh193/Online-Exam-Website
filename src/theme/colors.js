// Color constants for the application

// Primary colors
export const PRIMARY = {
  purple: '#4A4AFF',  // Main purple color
};

// Neutral colors
export const NEUTRAL = {
  headingBlack: '#404D61',
  textGray: '#858E9F',
  color1000: '#0D2A3E',  // Dark navy blue
  color900: '#1A365D',
  color800: '#2D3748',
  color700: '#4A5568',
  color600: '#718096',
  color500: '#A0AEC0',
  color400: '#CBD5E0',  // Light blue for Primary Exam card
  color300: '#E2E8F0',
  color200: '#EDF2F7',
  white: '#FFFFFF',
};

// Theme combinations
export const THEME = {
  primary: PRIMARY.purple,
  background: NEUTRAL.white,
  text: {
    primary: NEUTRAL.headingBlack,
    secondary: NEUTRAL.textGray,
  },
  surface: {
    light: NEUTRAL.color200,
    lighter: NEUTRAL.color300,
  },
  border: NEUTRAL.color300,
};

// Additional theme colors
export const ADDITIONAL = {
  beige: '#FCE9D9',  // NSI Exam card background
};

// Export all colors as a single object
export const COLORS = {
  ...PRIMARY,
  ...NEUTRAL,
};

export default {
  PRIMARY,
  NEUTRAL,
  THEME,
  COLORS,
}; 