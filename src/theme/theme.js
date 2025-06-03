import { createTheme } from '@mui/material/styles';
import { THEME, NEUTRAL } from './colors';

// Create a white theme
const theme = createTheme({
  palette: {
    primary: {
      main: THEME.background, // White for AppBar
      contrastText: THEME.text.primary, // Dark text for contrast on white
    },
    secondary: {
      main: THEME.primary, // Purple for buttons and accents
    },
    background: {
      default: THEME.background,
      paper: THEME.background,
    },
    text: {
      primary: THEME.text.primary,
      secondary: THEME.text.secondary,
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: THEME.text.primary,
    },
    h2: {
      fontWeight: 600,
      color: THEME.text.primary,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
          borderBottom: `1px solid ${THEME.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedSecondary: {
          color: THEME.background,
          '&:hover': {
            backgroundColor: NEUTRAL.color800,
          },
        },
        outlinedSecondary: {
          borderColor: THEME.primary,
          color: THEME.primary,
          '&:hover': {
            borderColor: NEUTRAL.color800,
            color: NEUTRAL.color800,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: THEME.background,
          borderColor: THEME.border,
        },
      },
    },
  },
});

export default theme; 