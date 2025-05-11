import { createTheme } from "@mui/material/styles";

import "@mui/material/styles";

declare module "@mui/material/styles" {
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

/* ----------  LIGHT THEME  ---------- */
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6B4022",
      light: "#8C5D3C",
      dark: "#4A2B14",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F7D363",
      contrastText: "#2C1A0B",
    },
    background: {
      default: "#FFF9ED",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2C1A0B", // Dark brown for main text
      secondary: "#6B4022", // Lighter brown for secondary text
    },
    divider: "#D7C9A4", // A color from your selection, good for dividers
    // Add action colors for better default component behavior
    action: {
      active: "rgba(0, 0, 0, 0.54)", // Default MUI active icon color
      hover: "rgba(107, 64, 34, 0.08)", // primary.main with low alpha
      hoverOpacity: 0.08,
      selected: "rgba(107, 64, 34, 0.16)", // primary.main with higher alpha
      selectedOpacity: 0.16,
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      focus: "rgba(0, 0, 0, 0.12)",
      focusOpacity: 0.12,
    },
    mountain: {
      // Example custom colors
      100: "#EFEBE9", // Light Brownish Grey
      400: "#A1887F", // Muted Brown
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          paddingLeft: 16,
          paddingRight: 16,

          /* ── DEFAULT ─────────────────────────────── */
          color: theme.palette.primary.dark, // #4A2B14
          "& .MuiListItemIcon-root": {
            color: theme.palette.primary.dark,
          },

          /* ── HOVER ───────────────────────────────── */
          "&:hover": {
            backgroundColor: "#F0E4D4", // light cream
            color: theme.palette.primary.dark, // dark brown
            "& .MuiListItemIcon-root": {
              color: theme.palette.primary.dark,
            },
          },

          /* ── SELECTED ────────────────────────────── */
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main, // #6B4022
            color: theme.palette.primary.contrastText, // #FFFFFF
            fontWeight: 600,
            "& .MuiListItemIcon-root": {
              color: theme.palette.primary.contrastText,
            },
            "&:hover": {
              // selected + hover
              backgroundColor: theme.palette.primary.light, // #8C5D3C
            },
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          // No global color here, handled by MuiListItemButton
          minWidth: 36, // Adjusted minWidth slightly
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: ({ theme }) => ({
          fontWeight: 500, // Default weight
          // No global color here, handled by MuiListItemButton
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#FFF4DB", // Your desired light creamy drawer background
        },
      },
    },
    MuiAppBar: {
      // Example: making AppBar consistent with the theme
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper, // White like other paper elements
          color: theme.palette.text.primary, // Dark brown text
        }),
      },
    },
    MuiChip: {
      // Example: styling chips to fit
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main, // Yellow accent
          color: theme.palette.secondary.contrastText, // Dark brown text on yellow
        }),
        colorPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }),
      },
    },
  },
});

/* ----------  DARK THEME  ---------- */
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      // Yellow accent is primary in dark mode
      main: "#F7D363",
      light: "#FFDF7F",
      dark: "#D4B349",
      contrastText: "#1A1405", // Very dark brown/black for contrast on yellow
    },
    secondary: {
      // Brown is secondary
      main: "#8C5D3C", // Lighter brown for dark mode accents
      light: "#A98365",
      dark: "#6B4022",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#1E1A17", // Dark, warm brown-ish background
      paper: "#2C2520", // Slightly lighter warm brown-ish paper
    },
    text: {
      primary: "#FFF0DD", // Creamy off-white for primary text
      secondary: "#D7C9A4", // Beige/light brown for secondary text
    },
    divider: "#4A3B2A", // Dark brown divider
    action: {
      // Action colors for dark theme
      active: "rgba(255, 255, 255, 0.7)",
      hover: "rgba(247, 211, 99, 0.08)", // primary.main (yellow) with low alpha
      hoverOpacity: 0.08,
      selected: "rgba(247, 211, 99, 0.16)", // primary.main (yellow) with higher alpha
      selectedOpacity: 0.16,
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      focus: "rgba(255, 255, 255, 0.12)",
      focusOpacity: 0.12,
    },
    mountain: {
      // Example custom colors for dark theme
      100: "#4E443A", // Darker Brownish Grey
      400: "#3E352E", // Very Dark Brownish Grey
    },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          paddingLeft: 16,
          paddingRight: 16,
          // Default state for text and icon
          color: theme.palette.text.secondary, // Beige text
          "& .MuiListItemIcon-root": {
            color: theme.palette.text.secondary, // Beige icon
          },
          "&:hover": {
            backgroundColor: theme.palette.action.hover, // Yellow highlight (primary.main with alpha)
            color: theme.palette.primary.main, // Text becomes yellow
            "& .MuiListItemIcon-root": {
              color: theme.palette.primary.main, // Icon also becomes yellow
            },
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.dark, // Darker yellow background for selected
            color: theme.palette.primary.contrastText, // Dark text on yellow selected BG
            fontWeight: "bold",
            "& .MuiListItemIcon-root": {
              color: theme.palette.primary.contrastText, // Dark icon on yellow selected BG
            },
            "&:hover": {
              // Hover on selected item
              backgroundColor: theme.palette.primary.main, // Brighter yellow on hover
            },
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 36,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: ({ theme }) => ({
          fontWeight: 500,
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper, // Use dark paper color
        }),
      },
    },
    MuiAppBar: {
      // Example: making AppBar consistent with the theme
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default, // Darker default background
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiChip: {
      // Example: styling chips to fit
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main, // Yellow accent
          color: theme.palette.primary.contrastText, // Dark text on yellow
        }),
        // If you have secondary chips, define them too:
        // colorSecondary: ({theme}) => ({
        //     backgroundColor: theme.palette.secondary.main,
        //     color: theme.palette.secondary.contrastText,
        // }),
      },
    },
  },
});
