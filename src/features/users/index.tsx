import { Container } from '@mui/material';
import React, { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DeleteConfirmationDialog } from './components/DeleteConfirmationDialog';
import { PageNotifier } from './components/PageNotifier';
import { UserActionMenu } from './components/UserActionMenu';
import { UserEditViewDialog } from './components/UserEditViewDialog';
import { UserTable } from './components/UserTable';
import { UserDataProvider, useUserData } from './context/UserDataContext';
import {
  UserInterfaceProvider,
  useUserInterface,
} from './context/UserInterfaceContext';

const UserManagementView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { deleteUserMutation, bulkDeleteUsersMutation } = useUserData();
  const {
    selectedIds,
    dialogs,
    handleCloseDeleteDialog,
    handleCloseBulkDeleteDialog,
    resetSelection,
    showPageNotification,
    handleOpenUserDetailDialog,
    handleOpenDeleteConfirmDialog,
    userMenu,
    snackbar,
    handlePageSnackbarClose,
  } = useUserInterface();

  const handleDeleteUser = useCallback(() => {
    const userToDelete = dialogs.delete.user;
    if (userToDelete?.id === currentUser?.id) {
      showPageNotification(`You cannot delete yourself !`, 'warning');
      return;
    }
    if (!userToDelete) return;

    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        showPageNotification(
          `User "${userToDelete.username}" deleted successfully.`,
          'success',
        );
        handleCloseDeleteDialog();
      },
      onError: (error) =>
        showPageNotification(
          `Failed to delete user: ${error.message}`,
          'error',
        ),
    });
  }, [
    dialogs.delete.user,
    deleteUserMutation,
    showPageNotification,
    handleCloseDeleteDialog,
  ]);

  const executeBulkDelete = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (selectedIds.includes(currentUser?.id || '')) {
      showPageNotification(`You cannot delete yourself !`, 'warning');
      return;
    }

    bulkDeleteUsersMutation.mutate(selectedIds, {
      onSuccess: () => {
        showPageNotification(
          `${selectedIds.length} user(s) deleted successfully.`,
          'success',
        );
        resetSelection();
        handleCloseBulkDeleteDialog();
      },
      onError: (error) =>
        showPageNotification(
          `Failed to delete users: ${error.message}`,
          'error',
        ),
    });
  }, [
    selectedIds,
    bulkDeleteUsersMutation,
    showPageNotification,
    resetSelection,
    handleCloseBulkDeleteDialog,
  ]);

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 1, md: 4 }, py: { xs: 2, md: 4 } }}
      >
        <UserTable />
      </Container>

      {dialogs.editView.open && (
        <UserEditViewDialog
          open={dialogs.editView.open}
          user={dialogs.editView.user}
          isCreatingNewUser={dialogs.editView.isCreating}
        />
      )}

      <UserActionMenu
        anchorEl={userMenu.anchorEl}
        onEdit={() => handleOpenUserDetailDialog(userMenu.user)}
        onDelete={() => {
          if (userMenu.user) {
            handleOpenDeleteConfirmDialog(userMenu.user);
          }
        }}
      />

      <DeleteConfirmationDialog
        open={dialogs.delete.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteUser}
        isPending={deleteUserMutation.isPending}
        title="Confirm Deletion"
        contentText={`Are you sure you want to delete user "${dialogs.delete.user?.username || ''}"? This action cannot be undone.`}
      />

      <DeleteConfirmationDialog
        open={dialogs.bulkDelete.open}
        onClose={handleCloseBulkDeleteDialog}
        onConfirm={executeBulkDelete}
        isPending={bulkDeleteUsersMutation.isPending}
        title="Confirm Bulk Deletion"
        contentText={`Are you sure you want to delete ${selectedIds.length} selected user(s)? This action cannot be undone.`}
        confirmButtonText="Delete Selected"
      />

      <PageNotifier
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handlePageSnackbarClose}
      />
    </>
  );
};

const UserManagementPage: React.FC = () => {
  return (
    <UserDataProvider>
      <UserInterfaceProvider>
        <UserManagementView />
      </UserInterfaceProvider>
    </UserDataProvider>
  );
};

export default UserManagementPage;
