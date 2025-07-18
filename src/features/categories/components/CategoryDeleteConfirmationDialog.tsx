import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React from 'react';

interface CategoryDeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  title: string;
  contentText: string;
  confirmButtonText?: string;
}

export const CategoryDeleteConfirmationDialog: React.FC<
  CategoryDeleteConfirmationDialogProps
> = ({
  open,
  onClose,
  onConfirm,
  isPending,
  title,
  contentText,
  confirmButtonText = 'Delete',
}) => {
  return (
    <Dialog open={open} onClose={!isPending ? onClose : () => {}} maxWidth="xs">
      <DialogTitle>
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>{contentText}</Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isPending}
        >
          {isPending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            confirmButtonText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
