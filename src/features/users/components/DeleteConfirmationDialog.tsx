import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  title: string;
  contentText: string;
  confirmButtonText?: string;
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({
  open,
  onClose,
  onConfirm,
  isPending,
  title,
  contentText,
  confirmButtonText = "Delete",
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
