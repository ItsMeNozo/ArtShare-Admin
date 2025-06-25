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
  Save as SaveIcon,
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
        <Typography variant="h6">Category Details</Typography>
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
            sx={{ gap: 2 }}
          >
            {getDialogTitle()}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isCreatingNewCategory && (
                <Button
                  onClick={handleEditToggle}
                  color={isEditing ? "inherit" : "primary"}
                  disabled={formik.isSubmitting}
                  size="small"
                  variant={isEditing ? "outlined" : "contained"}
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
              {isEditing && (
                <Button
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
                  size="small"
                >
                  {formik.isSubmitting
                    ? "Saving..."
                    : isCreatingNewCategory
                      ? "Create"
                      : "Save"}
                </Button>
              )}
              <IconButton
                onClick={handleClose}
                disabled={formik.isSubmitting}
                size="small"
                sx={{ ml: 0.5 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
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

        {isCreatingNewCategory && (
          <DialogActions sx={{ p: 2, gap: 0.5 }}>
            <Button
              onClick={handleClose}
              disabled={formik.isSubmitting}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
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
              {formik.isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </DialogActions>
        )}
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
