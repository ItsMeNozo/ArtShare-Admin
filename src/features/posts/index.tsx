import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect } from 'react';

import { PostsDataProvider, usePostsData } from './context/PostsDataContext';
import { PostsUIProvider, usePostsUI } from './context/PostsUIContext';

import { useLocation } from 'react-router-dom';
import ConfirmationDialog from './components/ConfirmationDialog';
import AdminPostEditModal from './components/PostEditModal';
import AdminPostsTable from './components/PostsTable';
import PostTableToolbar from './components/PostTableToolbar';
import {
  useBulkDeleteAdminPosts,
  useDeleteAdminPost,
} from './hooks/usePostQueries';

const AdminPostsView: React.FC = () => {
  const { posts, isLoading, error: fetchError } = usePostsData();
  const {
    selected,
    handleDeselectAll,
    confirmDialogState,
    showConfirmation,
    closeConfirmation,
    snackbar,
    showSnackbar,
    closeSnackbar,
    anchorEl,
    currentPostForMenu,
    handleMenuClose,
    openEditModal,
    closeEditModal,
    editingPostId,
  } = usePostsUI();

  const deletePostMutation = useDeleteAdminPost();
  const bulkDeletePostsMutation = useBulkDeleteAdminPosts();

  const location = useLocation();
  const postId = location.state?.postId;

  useEffect(() => {
    if (!postId) return;
    openEditModal(postId);
  }, [postId, posts]);

  const isActionLoading =
    deletePostMutation.isPending || bulkDeletePostsMutation.isPending;

  const handleBulkDelete = useCallback(() => {
    if (selected.length === 0) return;
    showConfirmation(
      'Confirm Bulk Deletion',
      `Are you sure you want to delete ${selected.length} selected post(s)? This action cannot be undone.`,
      () => {
        bulkDeletePostsMutation.mutate(selected as number[], {
          onSuccess: (data) => {
            showSnackbar(
              `${data.count} post(s) deleted successfully!`,
              'success',
            );
            handleDeselectAll();
          },
          onError: (err) =>
            showSnackbar(`Failed to delete posts: ${err.message}`, 'error'),
          onSettled: () => closeConfirmation(),
        });
      },
    );
  }, [
    selected,
    bulkDeletePostsMutation,
    showConfirmation,
    showSnackbar,
    handleDeselectAll,
    closeConfirmation,
  ]);

  const handleDeleteFromMenu = useCallback(() => {
    if (!currentPostForMenu) return;
    const { id, title } = currentPostForMenu;
    handleMenuClose();
    showConfirmation(
      'Confirm Deletion',
      `Are you sure you want to delete post "${title}" (ID: ${id})?`,
      () => {
        deletePostMutation.mutate(id, {
          onSuccess: () =>
            showSnackbar(`Post "${title}" deleted successfully.`, 'success'),
          onError: (err) =>
            showSnackbar(`Failed to delete post: ${err.message}`, 'error'),
          onSettled: () => closeConfirmation(),
        });
      },
    );
  }, [
    currentPostForMenu,
    deletePostMutation,
    showConfirmation,
    showSnackbar,
    handleMenuClose,
    closeConfirmation,
  ]);

  const handlePostUpdated = useCallback(() => {
    closeEditModal();
    showSnackbar('Post updated successfully!', 'success');
  }, [closeEditModal, showSnackbar]);

  if (isLoading && !posts.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Posts...</Typography>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ px: { xs: 1, md: 4 }, py: { xs: 2, md: 4 } }}
    >
      <Paper sx={{ p: 3 }}>
        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}

        <PostTableToolbar
          title="Post Management"
          onBulkDelete={handleBulkDelete}
          isActionLoading={isActionLoading}
        />

        <AdminPostsTable />

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={handleMenuClose}
          MenuListProps={{
            'aria-labelledby': `actions-button-for-post-${currentPostForMenu?.id}`,
          }}
        >
          <MenuItem onClick={() => openEditModal(currentPostForMenu!.id)}>
            <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              const userUrl = import.meta.env.VITE_FE_USER_URL || '';
              window.open(
                `${userUrl}/posts/${currentPostForMenu?.id}`,
                '_blank',
              );
              handleMenuClose();
            }}
          >
            <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} /> View Public
          </MenuItem>
          <MenuItem onClick={handleDeleteFromMenu} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete
          </MenuItem>
        </Menu>

        <ConfirmationDialog
          {...confirmDialogState}
          isActionLoading={isActionLoading}
          onClose={closeConfirmation}
          onConfirm={() => confirmDialogState.onConfirmAction?.()}
        />

        {editingPostId && (
          <AdminPostEditModal onPostUpdated={handlePostUpdated} />
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={closeSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

const PostManagementPage: React.FC = () => {
  return (
    <PostsDataProvider>
      <PostsUIProvider>
        <AdminPostsView />
      </PostsUIProvider>
    </PostsDataProvider>
  );
};

export default PostManagementPage;
