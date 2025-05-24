import React, { useMemo, useCallback, useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  MenuItem,
  Menu,
  Snackbar,
  AlertColor,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  bulkDeleteAdminPosts,
  AdminPostListItemDto,
  adminDeletePost,
} from './api/post.api';
import ConfirmationDialog from './components/ConfirmationDialog';
import AdminPostEditModal from './components/AdminPostEditModal';
import PostTableToolbar from './components/PostTableToolbar';
import AdminPostsTable from './components/AdminPostsTable';

import { useAdminPosts } from './hooks/useAdminPosts';
import { useTableSelection } from './hooks/useTableSelection';
import { useRowActionMenu } from './hooks/useRowActionMenu';
import { useConfirmationDialog } from './hooks/useConfirmationDialog';
import { useEditModal } from './hooks/useEditModal';

const AdminPostsPage: React.FC = () => {
  const {
    posts,
    totalPosts,
    page,
    rowsPerPage,
    orderBy,
    order,
    loading,
    error: fetchError,
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    handleChangePage,
    handleChangeRowsPerPage,
    handleRequestSort,
    refreshPosts,
  } = useAdminPosts();

  const {
    selected,
    setSelected,
    handleSelectAllClick,
    handleClick: handleSelectRow,
    isSelected,
    handleDeselectAll,
    numSelected,
  } = useTableSelection();

  const {
    anchorEl,
    currentMenuOpenItem: currentPostForMenu,
    isMenuOpen: menuOpen,
    handleMenuOpen,
    handleMenuClose,
  } = useRowActionMenu<AdminPostListItemDto>();

  const {
    dialogState: confirmDialogState,
    showConfirmation,
    closeConfirmation,
  } = useConfirmationDialog();

  const {
    isModalOpen: editModalOpen,
    editingItemId: editingPostId,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useEditModal<number>();

  const [actionLoading, setActionLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>('success');

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleBulkDelete = async () => {
    if (numSelected === 0) return;

    const performAction = async () => {
      setActionLoading(true);

      try {
        await bulkDeleteAdminPosts(selected);
        setSnackbarMessage(`${selected.length} post(s) deleted successfully!`);
        setSnackbarSeverity('success');
        setSelected([]);
        await refreshPosts();
      } catch (err) {
        const errorMsg = `Failed to delete ${selected.length} selected post(s).`;
        setSnackbarMessage(errorMsg);
        setSnackbarSeverity('error');
        console.error('Bulk delete failed:', err);
      } finally {
        setActionLoading(false);
        closeConfirmation();
        setSnackbarOpen(true);
      }
    };

    showConfirmation(
      'Confirm Deletion',
      `Are you sure you want to delete ${numSelected} selected post(s)? This action cannot be undone.`,
      performAction,
    );
  };

  const handleEditPostFromMenu = () => {
    if (currentPostForMenu) {
      openEditModal(currentPostForMenu.id);
    }
    handleMenuClose();
  };

  const handleDeletePostFromMenu = () => {
    if (currentPostForMenu) {
      const { id, title } = currentPostForMenu;
      const performDelete = async () => {
        setActionLoading(true);

        try {
          await adminDeletePost(id);
          setSnackbarMessage(`Post "${title}" deleted successfully!`);
          setSnackbarSeverity('success');
          await refreshPosts();
          setSelected((prevSelected) =>
            prevSelected.filter((selId) => selId !== id),
          );
        } catch (err) {
          const errorMsg = `Failed to delete post "${title}".`;
          setSnackbarMessage(errorMsg);
          setSnackbarSeverity('error');
          console.error(`Delete post ${id} failed:`, err);
        } finally {
          setActionLoading(false);
          closeConfirmation();
          setSnackbarOpen(true);
        }
      };
      showConfirmation(
        'Confirm Deletion',
        `Are you sure you want to delete post "${title}" (ID: ${id})? This action cannot be undone.`,
        performDelete,
      );
    }
    handleMenuClose();
  };

  const getDataForExport = useCallback(() => {
    return numSelected > 0
      ? posts.filter((p) => selected.includes(p.id))
      : posts;
  }, [posts, selected, numSelected]);

  const csvFormattedData = useMemo(() => {
    const dataToExport = getDataForExport();
    return dataToExport.map((post) => ({
      ID: post.id,
      Title: post.title,
      Author: post.user.username || String(post.user_id),
      CreatedAt: format(new Date(post.created_at), 'yyyy-MM-dd HH:mm:ss'),
    }));
  }, [getDataForExport]);

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const dataToExport = getDataForExport();
    const pdfData = dataToExport.map((post) => [
      post.id,
      post.title,
      post.user.username || String(post.user_id),
      format(new Date(post.created_at), 'MMM dd, yyyy HH:mm'),
    ]);
    autoTable(doc, {
      head: [['ID', 'Title', 'Author', 'Created At']],
      body: pdfData,
      startY: 20,
      didDrawPage: (data) => {
        doc.setFontSize(16);
        doc.text('Admin Posts Report', data.settings.margin.left, 15);
      },
    });
    doc.save('admin-posts-report.pdf');
  };

  const postIdsOnPage = useMemo(() => posts.map((p) => p.id), [posts]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Admin - Post Management
      </Typography>
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}
      {/* 
        Removed actionError Alert as Snackbar will handle this feedback for delete operations
        {actionError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setActionError(null)}
          >
            {actionError}
          </Alert>
        )} 
      */}
      <PostTableToolbar
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        selectedPostsCount={numSelected}
        onBulkDelete={handleBulkDelete}
        onDeselectAll={handleDeselectAll}
        onExportPDF={handleExportPDF}
        csvFormattedData={csvFormattedData}
        isActionLoading={actionLoading}
      />
      <AdminPostsTable
        posts={posts}
        loading={loading}
        fetchError={fetchError}
        totalPosts={totalPosts}
        page={page}
        rowsPerPage={rowsPerPage}
        orderBy={orderBy}
        order={order}
        numSelected={numSelected}
        postIdsOnPage={postIdsOnPage}
        debouncedSearchTerm={debouncedSearchTerm}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onRequestSort={handleRequestSort}
        onSelectAllClick={handleSelectAllClick}
        onSelectRow={handleSelectRow}
        isSelected={isSelected}
        onMenuOpen={handleMenuOpen}
        menuOpen={menuOpen}
        currentMenuPostId={currentPostForMenu?.id}
      />
      <Menu
        id={
          currentPostForMenu
            ? `actions-menu-for-post-${currentPostForMenu.id}`
            : undefined
        }
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': currentPostForMenu
            ? `actions-button-for-post-${currentPostForMenu.id}`
            : undefined,
        }}
      >
        <MenuItem onClick={handleEditPostFromMenu}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit
        </MenuItem>
        {currentPostForMenu && (
          <MenuItem
            onClick={() => {
              const userUrl = import.meta.env.VITE_FE_USER_URL || '';
              window.open(
                `${userUrl}/posts/${currentPostForMenu.id}`,
                '_blank',
              );
              handleMenuClose();
            }}
          >
            <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} /> View Public
          </MenuItem>
        )}
        <MenuItem
          onClick={handleDeletePostFromMenu}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete
        </MenuItem>
      </Menu>
      <ConfirmationDialog
        open={confirmDialogState.open}
        onClose={() => {
          if (!actionLoading) {
            closeConfirmation();
          }
        }}
        onConfirm={() => {
          if (confirmDialogState.onConfirmAction) {
            confirmDialogState.onConfirmAction();
          }
        }}
        title={confirmDialogState.title}
        message={confirmDialogState.message}
        isActionLoading={actionLoading}
      />
      {editingPostId && (
        <AdminPostEditModal
          open={editModalOpen}
          onClose={closeEditModal}
          postId={editingPostId}
          onPostUpdated={async () => {
            closeEditModal();
            await refreshPosts();

            setSnackbarMessage('Post updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
          }}
        />
      )}

      {/* Snackbar for success/failure messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPostsPage;
