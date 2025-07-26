import { SnackbarOrigin } from '@mui/material';
import { createContext, ReactNode, useContext } from 'react';

type SnackbarContextType = {
  showSnackbar: (
    message: string,
    severity?: 'success' | 'info' | 'warning' | 'error',
    action?: ReactNode,
    anchorOrigin?: SnackbarOrigin,
  ) => void;
};

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context)
    throw new Error('useSnackbar must be used within SnackbarProvider');
  return context;
};
