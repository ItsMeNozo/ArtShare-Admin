import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  AlertColor,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Category } from "../../../types/category";
import { CategoryForm } from "./CategoryForm";
import { useCategoryForm } from "../hooks/useCategoryForm";

interface CategoryEditViewDialogProps {
  open: boolean;
  category: Category | null;
  isCreatingNewCategory: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryEditViewDialog: React.FC<CategoryEditViewDialogProps> = ({
  open,
  category: initialCategory,
  isCreatingNewCategory,
  onClose,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(isCreatingNewCategory);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "info" });
  const [closeDialogOnSnackbarHide, setCloseDialogOnSnackbarHide] =
    useState(false);

  const showNotification = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSuccess = (message: string) => {
    showNotification(message, "success");
    setCloseDialogOnSnackbarHide(true);
    if (!isCreatingNewCategory) {
      setIsEditing(false);
    }
    onSuccess();
  };

  const handleError = (message: string) => {
    showNotification(message, "error");
  };

  const formik = useCategoryForm({
    initialCategory,
    isCreatingNewCategory,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  useEffect(() => {
    setIsEditing(isCreatingNewCategory);
    if (open) {
      setCloseDialogOnSnackbarHide(false);
    }
  }, [initialCategory, isCreatingNewCategory, open]);

  const handleSnackbarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
    if (closeDialogOnSnackbarHide) {
      onClose();
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      formik.resetForm();
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    formik.handleSubmit();
  };

  const handleClose = () => {
    if (formik.dirty && isEditing) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?",
        )
      ) {
        formik.resetForm();
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getDialogTitle = () => {
    if (isCreatingNewCategory) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AddIcon color="primary" />
          <Typography variant="h6">Create New Category</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isEditing ? <EditIcon color="primary" /> : <ViewIcon color="action" />}
        <Typography variant="h6">
          {isEditing ? "Edit Category" : "View Category"}
        </Typography>
        {initialCategory && (
          <Chip
            label={initialCategory.type}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    );
  };

  const getActionButtons = () => {
    const buttons = [];

    if (!isCreatingNewCategory) {
      buttons.push(
        <Button
          key="edit-toggle"
          onClick={handleEditToggle}
          color={isEditing ? "inherit" : "primary"}
          disabled={formik.isSubmitting}
          startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
        >
          {isEditing ? "Cancel" : "Edit"}
        </Button>,
      );
    }

    buttons.push(
      <Button
        key="close"
        onClick={handleClose}
        disabled={formik.isSubmitting}
        color="inherit"
      >
        Close
      </Button>,
    );

    if (isEditing) {
      buttons.push(
        <Button
          key="save"
          variant="contained"
          onClick={handleSave}
          disabled={formik.isSubmitting || !formik.dirty}
          startIcon={
            formik.isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
        >
          {formik.isSubmitting
            ? "Saving..."
            : isCreatingNewCategory
              ? "Create Category"
              : "Save Changes"}
        </Button>,
      );
    }

    return buttons;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            minHeight: "60vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {getDialogTitle()}
            <IconButton
              onClick={handleClose}
              disabled={formik.isSubmitting}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <CategoryForm
            formik={formik}
            isEditing={isEditing}
            isCreatingNewCategory={isCreatingNewCategory}
            initialCategory={initialCategory}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          {getActionButtons()}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
