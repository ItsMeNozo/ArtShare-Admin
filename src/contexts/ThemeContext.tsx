// src/context/ThemeContext.tsx
import type { PaletteMode, Theme } from '@mui/material';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { darkTheme, lightTheme } from '../theme/themes'; // Adjust path as needed

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  // You could also get the preferred mode from localStorage here
  const [mode, setMode] = useState<PaletteMode>('light'); // Default to light

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      // Optionally, save preference to localStorage
      // localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme: Theme = useMemo(
    () => createTheme(mode === 'light' ? lightTheme : darkTheme),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />{' '}
        {/* Enables consistent baseline styling & background color from theme */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
