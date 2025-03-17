// Primary Colors
export const PRIMARY = {
  purple: '#4A4AFF', // Primary Purple
};

// Neutral Colors
export const NEUTRAL = {
  headingBlack: '#404D61', // Heading Black
  textGray: '#858E9F',    // Text Gray
  color1000: '#3F5C7E',   // Color 1000
  color900: '#7F7CA5',    // Color 900
  color800: '#8A83C4',    // Color 800
  color700: '#9B8DCD',    // Color 700
  color600: '#CCCA83',    // Color 600
  color500: '#DFDEF1',    // Color 500
  color400: '#E1E1FB',    // Color 400
  color300: '#F8F8FF',    // Color 300
  color200: '#F9F9FF',    // Color 200
  white: '#FFFFFF',       // White
};

// Theme color combinations
export const THEME = {
  primary: PRIMARY.purple,
  background: NEUTRAL.white,
  text: {
    primary: NEUTRAL.headingBlack,
    secondary: NEUTRAL.textGray,
  },
  surface: {
    light: NEUTRAL.color300,
    lighter: NEUTRAL.color200,
  },
  border: NEUTRAL.color500,
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