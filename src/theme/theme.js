import { createTheme } from '@mui/material/styles';
import { THEME, NEUTRAL, SEMANTIC } from './colors';
import { TYPOGRAPHY_SCALE, SPACING_SCALE, RADIUS_SCALE, BREAKPOINTS } from './tokens';

const greyScale = {
  50: NEUTRAL.color200,
  100: NEUTRAL.color300,
  300: NEUTRAL.color400,
  500: NEUTRAL.color500,
  600: NEUTRAL.color600,
  700: NEUTRAL.color700,
  900: NEUTRAL.color900,
};

const theme = createTheme({
  palette: {
    primary: {
      main: THEME.primary,
      contrastText: THEME.background,
    },
    secondary: {
      main: '#6A7EFC',
      contrastText: THEME.background,
    },
    background: {
      default: THEME.background,
      paper: THEME.background,
    },
    text: {
      primary: THEME.text.primary,
      secondary: THEME.text.secondary,
    },
    divider: NEUTRAL.color300,
    grey: greyScale,
    success: {
      ...SEMANTIC.success,
    },
    warning: {
      ...SEMANTIC.warning,
    },
    error: {
      ...SEMANTIC.error,
    },
    info: {
      ...SEMANTIC.info,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: BREAKPOINTS.mobile,
      md: BREAKPOINTS.tablet,
      lg: BREAKPOINTS.desktop,
      xl: 1536,
    },
  },
  shape: {
    borderRadius: parseInt(RADIUS_SCALE.md, 10),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: TYPOGRAPHY_SCALE.display,
      fontWeight: 700,
      lineHeight: 1.1,
      color: THEME.text.primary,
    },
    h2: {
      fontSize: TYPOGRAPHY_SCALE.xl,
      fontWeight: 600,
      lineHeight: 1.2,
      color: THEME.text.primary,
    },
    h3: {
      fontSize: TYPOGRAPHY_SCALE.lg,
      fontWeight: 600,
      lineHeight: 1.25,
    },
    subtitle1: {
      fontSize: TYPOGRAPHY_SCALE.md,
      lineHeight: 1.3,
      color: THEME.text.secondary,
    },
    body1: {
      fontSize: TYPOGRAPHY_SCALE.base,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: TYPOGRAPHY_SCALE.sm,
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--radius-sm': RADIUS_SCALE.sm,
          '--radius-md': RADIUS_SCALE.md,
          '--radius-lg': RADIUS_SCALE.lg,
          '--radius-pill': RADIUS_SCALE.pill,
          '--radius-round': RADIUS_SCALE.round,
          '--spacing-xs': SPACING_SCALE.xs,
          '--spacing-sm': SPACING_SCALE.sm,
          '--spacing-md': SPACING_SCALE.md,
          '--spacing-lg': SPACING_SCALE.lg,
          '--spacing-xl': SPACING_SCALE.xl,
          '--spacing-xxl': SPACING_SCALE.xxl,
        },
        body: {
          backgroundColor: THEME.background,
          color: THEME.text.primary,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: THEME.background,
          color: THEME.text.primary,
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
          borderBottom: `1px solid ${THEME.border}`,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: RADIUS_SCALE.md,
          padding: `${SPACING_SCALE.xs} ${SPACING_SCALE.md}`,
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#331FE3',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
          '&:disabled': {
            backgroundColor: NEUTRAL.color400,
            color: NEUTRAL.white,
          },
        },
        outlinedPrimary: {
          borderWidth: 1.5,
          '&:hover': {
            borderColor: '#331FE3',
            color: '#331FE3',
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
