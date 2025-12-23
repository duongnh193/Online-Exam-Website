// Centralized design tokens for typography, spacing, radii and responsive behavior

export const TYPOGRAPHY_SCALE = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  md: '1.25rem',    // 20px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  display: '3rem',  // 48px
};

export const SPACING_SCALE = {
  none: '0',
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
};

export const RADIUS_SCALE = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '999px',
  round: '50%',
};

export const BREAKPOINTS = {
  mobile: 600,
  tablet: 900,
  desktop: 1200,
};

export const ELEVATION = {
  base: '0 4px 20px rgba(0, 0, 0, 0.05)',
  hover: '0 6px 24px rgba(0, 0, 0, 0.08)',
  modal: '0 12px 32px rgba(15, 23, 42, 0.25)',
};

export default {
  TYPOGRAPHY_SCALE,
  SPACING_SCALE,
  RADIUS_SCALE,
  BREAKPOINTS,
  ELEVATION,
};
