import { Box, Paper, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { PageNotifier } from '../users/components/PageNotifier';
import { CategoryDeleteConfirmationDialog } from './components/CategoryDeleteConfirmationDialog';
import { CategoryEditViewDialog } from './components/CategoryEditViewDialog';
import { CategoryTable } from './components/CategoryTable';
import { CategoryToolbar } from './components/CategoryToolbar';
import {
  CategoryDataProvider,
  useCategoryData,
} from './context/CategoryDataContext';
import {
  CategoryInterfaceProvider,
  useCategoryInterface,
} from './context/CategoryInterfaceContext';

const CategoryManagementView: React.FC = () => {
  const { deleteCategory, deleteBulkCategories, refreshCategories } =
    useCategoryData();
  const {
    selectedIds,
    dialogs,
    handleCloseDeleteDialog,
    handleCloseBulkDeleteDialog,
    handleCloseCategoryDetailDialog,
    resetSelection,
    showPageNotification,
    snackbar,
    handlePageSnackbarClose,
  } = useCategoryInterface();

  const handleDeleteCategory = useCallback(() => {
    const categoryToDelete = dialogs.delete.category;
    if (!categoryToDelete) return;

    deleteCategory(categoryToDelete.id)
      .then(() => {
        showPageNotification('Category deleted successfully!', 'success');
        handleCloseDeleteDialog();
      })
      .catch((error) => {
        showPageNotification(
          `Failed to delete category: ${error.message}`,
          'error',
        );
      });
  }, [
    dialogs.delete.category,
    deleteCategory,
    showPageNotification,
    handleCloseDeleteDialog,
  ]);

  const executeBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;

    deleteBulkCategories(selectedIds)
      .then(() => {
        showPageNotification(
          `Successfully deleted ${selectedIds.length} categories!`,
          'success',
        );
        resetSelection();
        handleCloseBulkDeleteDialog();
      })
      .catch((error) => {
        showPageNotification(
          `Failed to delete categories: ${error.message}`,
          'error',
        );
      });
  }, [
    selectedIds,
    deleteBulkCategories,
    showPageNotification,
    resetSelection,
    handleCloseBulkDeleteDialog,
  ]);

  const handleDialogSuccess = useCallback(() => {
    refreshCategories();
  }, [refreshCategories]);

  const handleDialogError = useCallback(
    (message: string) => {
      showPageNotification(message, 'error');
    },
    [showPageNotification],
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Category Management
      </Typography>

      <Paper sx={{ p: 3 }}>
        <CategoryToolbar />
        <CategoryTable />
      </Paper>

      {/* Edit/Create Dialog */}
      <CategoryEditViewDialog
        open={dialogs.editView.open}
        category={dialogs.editView.category}
        isCreatingNewCategory={dialogs.editView.isCreating}
        onClose={handleCloseCategoryDetailDialog}
        onSuccess={handleDialogSuccess}
        onError={handleDialogError}
      />

      {/* Delete Single Category Dialog */}
      <CategoryDeleteConfirmationDialog
        open={dialogs.delete.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteCategory}
        isPending={false}
        title="Delete Category"
        contentText={
          dialogs.delete.category
            ? `Are you sure you want to delete "${dialogs.delete.category.name}"? This action cannot be undone.`
            : ''
        }
      />

      {/* Bulk Delete Dialog */}
      <CategoryDeleteConfirmationDialog
        open={dialogs.bulkDelete.open}
        onClose={handleCloseBulkDeleteDialog}
        onConfirm={executeBulkDelete}
        isPending={false}
        title="Delete Categories"
        contentText={`Are you sure you want to delete ${selectedIds.length} selected categories? This action cannot be undone.`}
        confirmButtonText="Delete All"
      />

      {/* Page Notifications */}
      <PageNotifier
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handlePageSnackbarClose}
      />
    </Box>
  );
};

const CategoryManagementPage: React.FC = () => {
  return (
    <CategoryDataProvider>
      <CategoryInterfaceProvider>
        <CategoryManagementView />
      </CategoryInterfaceProvider>
    </CategoryDataProvider>
  );
};

export default CategoryManagementPage;
