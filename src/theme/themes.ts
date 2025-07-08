import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import '@mui/material/styles';

// shared colour tokens
const SIDEBAR_LIGHT = '#111C43'; // left drawer when mode = light
const SIDEBAR_DARK = '#1A1C1E'; // left drawer when mode = dark
const PAGE_LIGHT = '#f4f6fa'; // content area when mode = light
const PAGE_DARK = '#181a1e'; // content area when mode = dark

declare module '@mui/material/styles' {
  interface Palette {
    mountain: {
      100: string;
      400: string;
    };
  }

  interface PaletteOptions {
    mountain?: {
      100: string;
      400: string;
    };
  }
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: PAGE_LIGHT, // 👉 right‑hand surface
      paper: '#ffffff', // keep cards white
    },
    primary: {
      main: '#6366F1', // indigo-500 (example, adjust to your primary)
      light: '#818CF8', // indigo-400
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0EA5E9', // sky-500 (example)
      // ... other secondary colors
    },
    text: {
      primary: '#1f2937', // Darker grey for primary text (like Tailwind's gray-800)
      secondary: '#6b7280', // Medium grey for secondary text (like Tailwind's gray-500)
    },
    // ... other palette colors (success, warning, error, info, divider)
    divider: '#e5e7eb', // Lighter divider (like Tailwind's gray-200)
    success: {
      main: '#2EB67D',
    },
    error: {
      main: '#E01E5A',
    },
    warning: {
      main: '#ECB22E',
    },
    info: {
      main: '#36C5F0',
    },
  },
  components: {
    MuiAppBar: {
      // NEW: Styling for AppBar
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper, // White background
          color: theme.palette.text.primary, // Dark text
          boxShadow: theme.shadows[1], // A subtle shadow, like elevation 1 or 2
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: SIDEBAR_LIGHT, // Your specified dark sidebar color
          color: alpha('#FFFFFF', 0.8), // Default text color for sidebar
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          // theme here is the lightTheme
          borderRadius: 6,
          margin: theme.spacing(0.5, 1.5), // Add some horizontal margin when open
          paddingLeft: theme.spacing(2), // Consistent padding
          paddingRight: theme.spacing(2),

          /* default state - white(80%) on #111C43 */
          color: '#7C9AC8', // Slightly less opaque for non-selected
          '& .MuiListItemIcon-root': {
            color: alpha('#FFFFFF', 0.8),
          },

          /* hover state */
          '&:hover': {
            backgroundColor: alpha('#FFFFFF', 0.08), // Subtle white overlay on hover
            color: alpha('#FFFFFF', 0.9),
            '& .MuiListItemIcon-root': {
              color: alpha('#FFFFFF', 0.9),
            },
          },

          /* selected state - like the reference UI */
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.15), // A very light tint of primary, or a light grey
            // or use a specific color: backgroundColor: '#2A3A6B', // Example: a lighter shade of the sidebar
            color: '#FFFFFF', // Bright white text for selected
            fontWeight: 600, // Ensure selected text is bold
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF', // Bright white icon for selected
            },
            '&:hover': {
              // Hover on selected
              backgroundColor: alpha(theme.palette.primary.main, 0.25),
              // or use a specific color: backgroundColor: '#3A4A7B',
            },
          },
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: 'inherit',
          fontWeight: 500,
          fontSize: '0.8125rem', // ~13px
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 28, // Reduce icon spacing
          fontSize: '18px', // Reduce icon size
          color: alpha('#FFFFFF', 0.7),
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Make 'root' a function
          backgroundColor: 'transparent',
          color: alpha('#FFFFFF', 0.6),
          lineHeight: '30px',
          marginLeft: theme.spacing(1.5), // Correctly resolves
          fontWeight: 500, // Or theme.typography.fontWeightMedium
          fontSize: '0.75rem',
          textTransform: 'uppercase',
        }),
      },
    },
    MuiDivider: {
      // Sidebar divider
      styleOverrides: {
        root: () => ({
          borderColor: alpha('#FFFFFF', 0.12), // Subtle white divider
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        // the outer container
        root: ({ theme }) => ({
          borderRadius: 16, // pill shape
          height: 28, // control the chip height
          fontWeight: 500, // semi-bold label
          textTransform: 'none', // keep “Today” capital-T only
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
        }),
        // when you do <Chip color="primary" />, this runs
        filledPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        // when you do <Chip color="secondary" />, this runs
        filledSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: '#fff',
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
        }),
        // ensure the label itself doesn’t get extra padding
        label: {
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === 'dark' ? '#1f2937' : '#f9fafb', // shadcn feel
          '& .MuiTableCell-root': {
            //   bolder header text
            fontWeight: 600,
            color: theme.palette.text.primary,
            borderBottom: 0,
          },
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? '#273549' : '#f3f4f6',
          },
        }),
      },
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
});

/* ----------  DARK THEME  ---------- */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6', // violet-500
      light: '#A78BFA', // violet-400
      dark: '#7C3AED', // violet-600
      contrastText: '#FFFFFF', // White text on violet
    },
    secondary: {
      main: '#0EA5E9',
      // ...
    },
    background: {
      default: PAGE_DARK, // Your slate-900 for overall app background
      paper: PAGE_DARK, // Your slate-800 for cards, AppBar background in dark mode
    },
    text: {
      primary: '#f1f5f9', // slate-100
      secondary: '#9ca3af', // slate-400
    },
    divider: '#334155', // slate-700
  },
  components: {
    MuiAppBar: {
      // NEW: Styling for AppBar in dark mode
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper, // Uses dark paper color (e.g., slate-800)
          color: theme.palette.text.primary, // Light text
          boxShadow: theme.shadows[1], // Or a different shadow for dark mode
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: SIDEBAR_DARK, // Consistent dark sidebar color
          color: alpha('#FFFFFF', 0.8),
        },
      },
    },
    MuiListItemButton: {
      // Styles can be largely the same as light theme if sidebar is always dark
      styleOverrides: {
        root: ({ theme }) => ({
          // theme here is the darkTheme
          borderRadius: 6,
          margin: theme.spacing(0.5, 1.5),
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),

          color: alpha('#FFFFFF', 0.7),
          '& .MuiListItemIcon-root': {
            color: alpha('#FFFFFF', 0.7),
          },
          '&:hover': {
            backgroundColor: alpha('#FFFFFF', 0.08),
            color: alpha('#FFFFFF', 0.9),
            '& .MuiListItemIcon-root': {
              color: alpha('#FFFFFF', 0.9),
            },
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.25), // Brighter primary tint for dark mode
            color: '#FFFFFF',
            fontWeight: 600,
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.35),
            },
          },
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: 'inherit',
          fontWeight: 500,
          fontSize: '0.8125rem', // ~13px
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 28, // Reduce icon spacing
          fontSize: '18px', // Reduce icon size
          color: alpha('#FFFFFF', 0.7),
        },
      },
    },

    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Make 'root' a function
          backgroundColor: 'transparent',
          color: alpha('#FFFFFF', 0.6),
          lineHeight: '30px',
          marginLeft: theme.spacing(1.5), // Correctly resolves
          fontWeight: 500,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
        }),
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: () => ({
          borderColor: alpha('#FFFFFF', 0.12),
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        // the outer container
        root: ({ theme }) => ({
          borderRadius: 16, // pill shape
          height: 28, // control the chip height
          fontWeight: 500, // semi-bold label
          textTransform: 'none', // keep “Today” capital-T only
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
        }),
        // when you do <Chip color="primary" />, this runs
        filledPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        // when you do <Chip color="secondary" />, this runs
        filledSecondary: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          color: '#fff',
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
        }),
        // ensure the label itself doesn’t get extra padding
        label: {
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor:
            theme.palette.mode === 'dark' ? '#1f2937' : '#f9fafb', // shadcn feel
          '& .MuiTableCell-root': {
            //   bolder header text
            fontWeight: 600,
            color: theme.palette.text.primary,
            borderBottom: 0,
          },
        }),
      },
    },
    // 2️⃣ Row hover
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? '#273549' : '#f3f4f6',
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Override button text color in dark mode for better visibility
          ...(theme.palette.mode === 'dark' && {
            '&.MuiButton-text': {
              color: theme.palette.text.primary, // Use primary text color instead of purple
            },
            '&.MuiButton-outlined': {
              color: theme.palette.text.primary, // Use primary text color for outlined buttons
              borderColor: theme.palette.divider,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderColor: theme.palette.text.secondary,
              },
            },
          }),
        }),
      },
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
});
