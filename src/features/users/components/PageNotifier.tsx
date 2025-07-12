import { Snackbar } from '@mui/material';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';
import React from 'react';

const PageSnackbarAlert = React.forwardRef<HTMLDivElement, AlertProps>(
  function PageSnackbarAlert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  },
);

interface PageNotifierProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: (_?: React.SyntheticEvent | Event, reason?: string) => void;
}

export const PageNotifier: React.FC<PageNotifierProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <PageSnackbarAlert
        onClose={onClose}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </PageSnackbarAlert>
    </Snackbar>
  );
};
