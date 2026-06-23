import { createTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// Colors extracted directly from the Vulkanizer Željko logo
const brand = {
  // Tyre-black from outer ring
  obsidian: '#111111',
  graphite: '#1A1A1A',
  graphiteMid: '#2B2B2B',
  graphiteLight: '#3A3A3A',
  // Steel from inner ring
  steel: '#AEAEAE',
  steelDark: '#6B6B6B',
  steelLight: '#D5D4D0',
  // Gold from wheel tick marks and "VULKANIZER" text
  gold: '#A67C3C',
  goldLight: '#C49A52',
  goldFaint: '#F4E8D0',
  goldBright: '#D4A855',
  // Poster background - industrial off-white
  offWhite: '#F0EFEC',
  cloud: '#ECEAE6',
  border: '#DDDBD5',
  borderDark: '#2E2E2E',
} as const;

const warmShadows = [
  'none',
  '0 1px 2px rgba(17,17,17,0.06)',
  '0 2px 4px rgba(17,17,17,0.07)',
  '0 4px 8px rgba(17,17,17,0.08)',
  '0 6px 12px rgba(17,17,17,0.09)',
  '0 8px 16px rgba(17,17,17,0.09)',
  '0 12px 24px rgba(17,17,17,0.10)',
  '0 16px 32px rgba(17,17,17,0.11)',
  '0 20px 40px rgba(17,17,17,0.12)',
  '0 24px 48px rgba(17,17,17,0.12)',
  '0 28px 56px rgba(17,17,17,0.13)',
  '0 32px 64px rgba(17,17,17,0.14)',
  '0 36px 72px rgba(17,17,17,0.14)',
  '0 40px 80px rgba(17,17,17,0.15)',
  '0 44px 88px rgba(17,17,17,0.15)',
  '0 48px 96px rgba(17,17,17,0.16)',
  '0 52px 104px rgba(17,17,17,0.16)',
  '0 56px 112px rgba(17,17,17,0.17)',
  '0 60px 120px rgba(17,17,17,0.17)',
  '0 64px 128px rgba(17,17,17,0.18)',
  '0 68px 136px rgba(17,17,17,0.18)',
  '0 72px 144px rgba(17,17,17,0.19)',
  '0 76px 152px rgba(17,17,17,0.19)',
  '0 80px 160px rgba(17,17,17,0.20)',
  '0 84px 168px rgba(17,17,17,0.21)',
] as Theme['shadows'];

export const getTheme = (mode: 'light' | 'dark'): Theme =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: {
              main: brand.gold,
              light: brand.goldLight,
              dark: '#8A6430',
              contrastText: '#fff',
            },
            secondary: {
              main: brand.graphite,
              light: brand.graphiteMid,
              dark: brand.obsidian,
              contrastText: '#fff',
            },
            background: {
              default: brand.offWhite,
              paper: '#FFFFFF',
            },
            text: {
              primary: brand.graphite,
              secondary: brand.steelDark,
              disabled: brand.steel,
            },
            divider: brand.border,
            error: { main: '#C0202A' },
            warning: { main: '#D97706' },
            success: { main: '#166534' },
            info: { main: '#1D4ED8' },
          }
        : {
            primary: {
              main: brand.goldBright,
              light: '#E0B86A',
              dark: brand.gold,
              contrastText: brand.graphite,
            },
            secondary: {
              main: '#F2F2F0',
              contrastText: brand.graphite,
            },
            background: {
              default: brand.obsidian,
              paper: brand.graphite,
            },
            text: {
              primary: '#F2F2F0',
              secondary: '#9A9A9A',
              disabled: brand.graphiteLight,
            },
            divider: brand.borderDark,
            error: { main: '#F87171' },
            warning: { main: '#FBBF24' },
            success: { main: '#4ADE80' },
            info: { main: '#60A5FA' },
          }),
    },
    typography: {
      fontFamily: '"Barlow", "Plus Jakarta Sans", system-ui, sans-serif',
      h1: {
        fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
        fontWeight: 800,
        letterSpacing: '-0.02em',
        lineHeight: 1.0,
      },
      h2: {
        fontFamily: '"Barlow Condensed", "Barlow", sans-serif',
        fontWeight: 800,
        letterSpacing: '-0.015em',
        lineHeight: 1.05,
      },
      h3: {
        fontFamily: '"Barlow", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1.15,
      },
      h4: {
        fontFamily: '"Barlow", sans-serif',
        fontWeight: 700,
        letterSpacing: '-0.005em',
        lineHeight: 1.2,
      },
      h5: { fontFamily: '"Barlow", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Barlow", sans-serif', fontWeight: 600 },
      subtitle1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 500 },
      subtitle2: {
        fontFamily: '"Barlow", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontSize: '0.7rem',
      },
      body1: { fontFamily: '"Plus Jakarta Sans", sans-serif', lineHeight: 1.65 },
      body2: { fontFamily: '"Plus Jakarta Sans", sans-serif', lineHeight: 1.6 },
      button: {
        fontFamily: '"Barlow", sans-serif',
        fontWeight: 700,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
      caption: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 500 },
      overline: {
        fontFamily: '"Barlow", sans-serif',
        fontWeight: 700,
        letterSpacing: '0.15em',
        fontSize: '0.7rem',
      },
    },
    shape: { borderRadius: 6 },
    shadows: warmShadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { scrollBehavior: 'smooth' },
          '::selection': { background: alpha(brand.gold, 0.2) },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 4,
            padding: '9px 20px',
            letterSpacing: '0.02em',
            transition: 'all 0.18s cubic-bezier(0.32,0.72,0,1)',
            '&:active': { transform: 'scale(0.97)' },
          },
          sizeLarge: { padding: '12px 28px', fontSize: '1rem', borderRadius: 4 },
          sizeSmall: { padding: '5px 12px', fontSize: '0.8125rem', borderRadius: 3 },
          contained: ({ theme }) => ({
            '&:hover': {
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
            },
          }),
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: ({ theme }) => ({
            borderColor: theme.palette.divider,
            borderRadius: 6,
          }),
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { backgroundImage: 'none', borderRadius: 8 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 4,
            transition: 'box-shadow 0.18s',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.text.secondary,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: theme.palette.primary.main,
            },
          }),
          notchedOutline: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            fontFamily: '"Barlow", sans-serif',
            fontWeight: 600,
            fontSize: '0.875rem',
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 3, fontWeight: 600, fontSize: '0.75rem' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { borderRadius: 3, margin: '2px 4px', fontFamily: '"Barlow", sans-serif', fontWeight: 500 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: 6, padding: '4px 0' },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 4, fontWeight: 500 },
        },
      },
    },
  });
