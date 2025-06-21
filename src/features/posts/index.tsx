import React, { useMemo, useCallback, useState } from "react";
import {
  Typography,
  Alert,
  MenuItem,
  Menu,
  Snackbar,
  AlertColor,
  Paper,
  Box,
  useTheme,
  TextField,
  Button,
  Stack,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  UndoOutlined as UndoOutlinedIcon,
  MoreVertOutlined as MoreVertOutlinedIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";

import {
  bulkDeleteAdminPosts,
  AdminPostListItemDto,
  adminDeletePost,
} from "./api/post.api";
import ConfirmationDialog from "./components/ConfirmationDialog";
import AdminPostEditModal from "./components/AdminPostEditModal";
import AdminPostsTable from "./components/AdminPostsTable";

import { useAdminPosts } from "./hooks/useAdminPosts";
import { useTableSelection } from "./hooks/useTableSelection";
import { useRowActionMenu } from "./hooks/useRowActionMenu";
import { useConfirmationDialog } from "./hooks/useConfirmationDialog";
import { useEditModal } from "./hooks/useEditModal";

const AdminPostsPage: React.FC = () => {
  const theme = useTheme();
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
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreAnchor(null);
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
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
        setSnackbarSeverity("success");
        setSelected([]);
        await refreshPosts();
      } catch (err) {
        const errorMsg = `Failed to delete ${selected.length} selected post(s).`;
        setSnackbarMessage(errorMsg);
        setSnackbarSeverity("error");
        console.error("Bulk delete failed:", err);
      } finally {
        setActionLoading(false);
        closeConfirmation();
        setSnackbarOpen(true);
      }
    };

    showConfirmation(
      "Confirm Deletion",
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
          setSnackbarSeverity("success");
          await refreshPosts();
          setSelected((prevSelected) =>
            prevSelected.filter((selId) => selId !== id),
          );
        } catch (err) {
          const errorMsg = `Failed to delete post "${title}".`;
          setSnackbarMessage(errorMsg);
          setSnackbarSeverity("error");
          console.error(`Delete post ${id} failed:`, err);
        } finally {
          setActionLoading(false);
          closeConfirmation();
          setSnackbarOpen(true);
        }
      };
      showConfirmation(
        "Confirm Deletion",
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
      CreatedAt: format(new Date(post.created_at), "yyyy-MM-dd HH:mm:ss"),
    }));
  }, [getDataForExport]);

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");
    const dataToExport = getDataForExport();
    const pdfData = dataToExport.map((post) => [
      post.id,
      post.title,
      post.user.username || String(post.user_id),
      format(new Date(post.created_at), "MMM dd, yyyy HH:mm"),
    ]);
    autoTable(doc, {
      head: [["ID", "Title", "Author", "Created At"]],
      body: pdfData,
      startY: 20,
      didDrawPage: (data) => {
        doc.setFontSize(16);
        doc.text("Admin Posts Report", data.settings.margin.left, 15);
      },
    });
    doc.save("admin-posts-report.pdf");
  };

  const postIdsOnPage = useMemo(() => posts.map((p) => p.id), [posts]);

  return (
    <Paper
      sx={{
        p: 3,
        m: 2,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="bold">
          Post Management
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}>
          {/* Search Filter */}
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: 250,
              backgroundColor:
                theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb",
              borderRadius: 2,
              "& input": {
                px: 1.5,
                py: 1,
              },
            }}
            InputProps={{
              sx: { fontSize: 14 },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}

      {/* Selection Toolbar - Only shown when posts are selected */}
      {numSelected > 0 && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            backgroundColor:
              theme.palette.mode === "dark" ? "#d1d5db" : "#e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: theme.palette.mode === "dark" ? "#000" : "#333",
            }}
          >
            {numSelected} selected from {totalPosts}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              variant="contained"
              onClick={handleBulkDelete}
              disabled={actionLoading}
              sx={{ textTransform: "none" }}
            >
              {actionLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>

            <Button
              onClick={handleDeselectAll}
              startIcon={<UndoOutlinedIcon />}
              sx={{ textTransform: "none" }}
            >
              Deselect all
            </Button>

            {/* More menu */}
            <Button
              variant="outlined"
              startIcon={<MoreVertOutlinedIcon />}
              onClick={handleMoreMenuOpen}
              sx={{ textTransform: "none" }}
            >
              More
            </Button>

            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={handleMoreMenuClose}
            >
              <MenuItem onClick={handleMoreMenuClose}>
                <CSVLink
                  data={csvFormattedData}
                  headers={[
                    { label: "ID", key: "ID" },
                    { label: "Title", key: "Title" },
                    { label: "Author", key: "Author" },
                    { label: "Created At", key: "CreatedAt" },
                  ]}
                  filename="posts.csv"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    width: "100%",
                    display: "block",
                  }}
                  target="_blank"
                >
                  Export CSV
                </CSVLink>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleExportPDF();
                  handleMoreMenuClose();
                }}
              >
                Export PDF
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
      )}
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
          "aria-labelledby": currentPostForMenu
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
              const userUrl = import.meta.env.VITE_FE_USER_URL || "";
              window.open(
                `${userUrl}/posts/${currentPostForMenu.id}`,
                "_blank",
              );
              handleMenuClose();
            }}
          >
            <VisibilityIcon fontSize="small" sx={{ mr: 1.5 }} /> View Public
          </MenuItem>
        )}
        <MenuItem
          onClick={handleDeletePostFromMenu}
          sx={{ color: "error.main" }}
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

            setSnackbarMessage("Post updated successfully!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
          }}
        />
      )}

      {/* Snackbar for success/failure messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdminPostsPage;
