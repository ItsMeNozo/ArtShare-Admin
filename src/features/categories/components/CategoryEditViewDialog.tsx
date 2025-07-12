import {
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Category } from '../../../types/category';
import { useCategoryForm } from '../hooks/useCategoryForm';
import { CategoryForm } from './CategoryForm';
import { getCategoryTypeColor } from './CategoryTable';

interface CategoryEditViewDialogProps {
  open: boolean;
  category: Category | null;
  isCreatingNewCategory: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const CategoryEditViewDialog: React.FC<CategoryEditViewDialogProps> = ({
  open,
  category: initialCategory,
  isCreatingNewCategory,
  onClose,
  onSuccess,
  onError,
}) => {
  const [isEditing, setIsEditing] = useState(isCreatingNewCategory);

  const handleSuccess = (message: string) => {
    formik.resetForm();
    onSuccess(message);
    onClose();
  };

  const handleError = (message: string) => {
    onError(message);
  };

  const formik = useCategoryForm({
    initialCategory,
    isCreatingNewCategory,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  useEffect(() => {
    setIsEditing(isCreatingNewCategory);
  }, [initialCategory, isCreatingNewCategory, open]);

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
          'You have unsaved changes. Are you sure you want to close?',
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color="primary" />
          <Typography variant="h6">Create New Category</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">Category Details</Typography>
        {initialCategory && (
          <Chip
            label={initialCategory.type}
            size="small"
            color={getCategoryTypeColor(initialCategory.type)}
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
            minHeight: '60vh',
            maxHeight: '90vh',
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isCreatingNewCategory && (
                <Button
                  onClick={handleEditToggle}
                  color={isEditing ? 'inherit' : 'primary'}
                  disabled={formik.isSubmitting}
                  size="small"
                  variant={isEditing ? 'outlined' : 'contained'}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
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
                    ? 'Saving...'
                    : isCreatingNewCategory
                      ? 'Create'
                      : 'Save'}
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
          <CategoryForm formik={formik} isEditing={isEditing} />
        </DialogContent>
      </Dialog>
    </>
  );
};
