// src/context/ThemeContext.tsx
import React, { createContext, useState, useMemo, useContext } from "react";
import type { ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import type { Theme } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { lightTheme, darkTheme } from "../theme/themes"; // Adjust path as needed
import { createTheme } from "@mui/material/styles";

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useCustomTheme must be used within a CustomThemeProvider");
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
  const [mode, setMode] = useState<PaletteMode>("light"); // Default to light

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      // Optionally, save preference to localStorage
      // localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme: Theme = useMemo(
    () => createTheme(mode === "light" ? lightTheme : darkTheme),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />{" "}
        {/* Enables consistent baseline styling & background color from theme */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
