import { Alert, Snackbar, SnackbarOrigin } from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { SnackbarContext } from '../hooks/useSnackbar';

// Define a default anchor origin
const DEFAULT_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: 'bottom',
  horizontal: 'center',
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<
    'success' | 'info' | 'warning' | 'error'
  >('info');
  const [actionNode, setActionNode] = useState<ReactNode>(null);
  // State to hold the anchorOrigin for the current snackbar
  const [currentAnchorOrigin, setCurrentAnchorOrigin] =
    useState<SnackbarOrigin>(DEFAULT_ANCHOR_ORIGIN);

  const showSnackbar = (
    msg: string,
    sev: 'success' | 'info' | 'warning' | 'error' = 'info',
    action?: ReactNode,
    anchor?: SnackbarOrigin, // Receive anchorOrigin
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setActionNode(action ?? null);
    // Use provided anchorOrigin or default
    setCurrentAnchorOrigin(anchor || DEFAULT_ANCHOR_ORIGIN);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Optionally reset anchorOrigin to default when snackbar closes,
    // though it will be set again on next `showSnackbar` call.
    // setCurrentAnchorOrigin(DEFAULT_ANCHOR_ORIGIN);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={currentAnchorOrigin} // Use the state for anchorOrigin
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="standard"
          action={actionNode}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
