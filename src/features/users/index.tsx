import React, { useState, useMemo, useCallback } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  useTheme,
  TableRow,
  TableCell,
  Snackbar,
} from "@mui/material";

import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

import { User } from "../../types/user";
import {
  getSubscriptionStatusInfo,
  getCurrentEffectivePlanNameForTable,
} from "./utils/userTable.utils";
import { defaultHeadCells } from "./constants/userTable.constants";

import { UserEditViewDialog } from "./components/UserEditViewDialog";
import { UserTableToolbar } from "./components/UserTableToolbar";
import { UserTableHeadComponent } from "./components/UserTableHeadComponent";
import { UserTableRowComponent } from "./components/UserTableRowComponent";

import { useUserTableControls } from "./hooks/useUserTableControls";
import {
  useDeleteUserMutation,
  useBulkDeleteUsersMutation,
} from "./hooks/user.queries";

interface DisplayUser extends User {
  currentPlan?: string;
}

const PageSnackbarAlert = React.forwardRef<HTMLDivElement, AlertProps>(
  function PageSnackbarAlert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  },
);

const UserManagementPage: React.FC = () => {
  const theme = useTheme();

  const {
    users,
    loading: tableLoading,
    error: tableError,
    totalUsers,
    currentPage,
    rowsPerPage,
    searchTerm,
    order,
    orderBy,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    handleSortRequest,
  } = useUserTableControls();

  const deleteUserMutation = useDeleteUserMutation();
  const bulkDeleteUsersMutation = useBulkDeleteUsersMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const resetSelection = useCallback(() => setSelectedIds([]), []);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedUserForMenu, setSelectedUserForMenu] = useState<User | null>(
    null,
  );
  const [userToEditView, setUserToEditView] = useState<User | null>(null);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] =
    useState<boolean>(false);
  const [isCreatingNewUserFlow, setIsCreatingNewUserFlow] =
    useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] =
    useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "info" });

  const showPageNotification = (message: string, severity: AlertColor) => {
    setSnackbar({ open: true, message, severity });
  };
  const handlePageSnackbarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    user: User,
  ) => {
    setUserMenuAnchorEl(event.currentTarget);
    setSelectedUserForMenu(user);
  };
  const handleCloseUserMenu = () => setUserMenuAnchorEl(null);

  const handleOpenUserDetailDialog = (
    user: User | null,
    isCreating: boolean = false,
  ) => {
    setUserToEditView(user);
    setIsCreatingNewUserFlow(isCreating);
    setIsUserDetailDialogOpen(true);
    handleCloseUserMenu();
  };
  const handleCloseUserDetailDialog = () => {
    setIsUserDetailDialogOpen(false);

    setTimeout(() => {
      setUserToEditView(null);
      setIsCreatingNewUserFlow(false);
    }, 150);
  };

  const handleOpenDeleteConfirmDialog = (userFromMenu?: User) => {
    const userToDelete = userFromMenu || selectedUserForMenu;
    if (userToDelete) {
      setSelectedUserForMenu(userToDelete);
      setOpenDeleteDialog(true);
    }
    handleCloseUserMenu();
  };

  const handleDeleteUser = () => {
    if (!selectedUserForMenu?.id) return;

    const userName = selectedUserForMenu.username;
    deleteUserMutation.mutate(selectedUserForMenu.id, {
      onSuccess: () => {
        showPageNotification(
          `User "${userName}" deleted successfully.`,
          "success",
        );
        setOpenDeleteDialog(false);
        setSelectedUserForMenu(null);
      },
      onError: (error) => {
        showPageNotification(
          `Failed to delete user: ${error.message}`,
          "error",
        );
      },
    });
  };

  const handleInitiateBulkDelete = () => {
    if (selectedIds.length > 0) {
      setOpenBulkDeleteDialog(true);
    } else {
      showPageNotification("No users selected for bulk deletion.", "info");
    }
  };

  const executeBulkDelete = () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    bulkDeleteUsersMutation.mutate(selectedIds, {
      onSuccess: () => {
        showPageNotification(
          `${count} user(s) deleted successfully.`,
          "success",
        );
        resetSelection();
        setOpenBulkDeleteDialog(false);
      },
      onError: (error) => {
        showPageNotification(
          `Failed to delete users: ${error.message}`,
          "error",
        );
      },
    });
  };

  const displayUsers: DisplayUser[] = useMemo(() => {
    return users.map((user) => ({
      ...user,
      currentPlan: getCurrentEffectivePlanNameForTable(
        user,
        getSubscriptionStatusInfo(user),
      ),
    }));
  }, [users]);

  const getDataForExport = useCallback(() => {
    return selectedIds.length > 0
      ? displayUsers.filter((u) => selectedIds.includes(u.id))
      : displayUsers;
  }, [displayUsers, selectedIds]);

  const csvFormattedData = useMemo(() => {
    const dataToExport = getDataForExport();
    return dataToExport.map((user) => ({
      Username: user.username,
      FullName: user.fullName || "",
      Email: user.email,
      Roles:
        user.roles
          ?.map((r: any) => (typeof r === "string" ? r : r.name))
          .join(" | ") || "",
      "Current Plan": user.currentPlan || "N/A",
      "Joined Date": user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",
    }));
  }, [getDataForExport]);

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");
    const dataToExport = getDataForExport();
    const pdfData = dataToExport.map((user) => [
      user.username ?? "",
      user.fullName ?? "",
      user.email ?? "",
      user.roles
        ?.map((r: any) => (typeof r === "string" ? r : r.name))
        .join(", ") || "",
      user.currentPlan ?? "N/A",
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
    ]);
    autoTable(doc, {
      head: [
        [
          "Username",
          "Full Name",
          "Email",
          "Roles",
          "Current Plan",
          "Joined Date",
        ],
      ],
      body: pdfData,
    });
    doc.save("users-page.pdf");
  };

  const handleRowCheckboxClick = (
    _: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id);
    } else {
      newSelected = selectedIds.filter((selectedId) => selectedId !== id);
    }

    setSelectedIds(newSelected);
  };

  const handleSelectAllClickOnPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const currentVisibleUserIds = displayUsers.map((u) => u.id);
    if (event.target.checked) {
      const idsToAdd = currentVisibleUserIds.filter(
        (id) => !selectedIds.includes(id),
      );
      setSelectedIds([...selectedIds, ...idsToAdd]);
      return;
    }

    setSelectedIds(
      selectedIds.filter((id) => !currentVisibleUserIds.includes(id)),
    );
  };

  if (tableLoading && users.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 120px)",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 1, md: 4 }, py: { xs: 2, md: 4 } }}
      >
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            m: { xs: 0.5, sm: 1, md: 2 },
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <UserTableToolbar
            searchTerm={searchTerm}
            onSearchChange={(event) => handleSearchChange(event.target.value)}
            onAddUser={() => handleOpenUserDetailDialog(null, true)}
            selectedIdsCount={selectedIds.length}
            onBulkDelete={handleInitiateBulkDelete}
            onDeselectAll={resetSelection}
            onExportPDF={handleExportPDF}
            csvFormattedData={csvFormattedData}
            theme={theme}
          />

          {tableError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {tableError}
            </Alert>
          )}

          {tableLoading && (users.length > 0 || searchTerm) && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <CircularProgress size={24} />{" "}
              <Typography variant="body2" sx={{ ml: 1 }}>
                Loading...
              </Typography>
            </Box>
          )}

          <TableContainer sx={{ boxShadow: "none" }}>
            <Table sx={{ minWidth: 750 }} aria-label="user management table">
              <UserTableHeadComponent
                headCells={defaultHeadCells}
                order={order}
                orderBy={orderBy}
                onRequestSort={(_event, property) =>
                  handleSortRequest(property)
                }
                onSelectAllClick={handleSelectAllClickOnPage}
                numSelected={
                  selectedIds.filter((id) =>
                    displayUsers.some((u) => u.id === id),
                  ).length
                }
                rowCount={displayUsers.length}
              />
              <TableBody>
                {!tableLoading && displayUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={defaultHeadCells.length + 2}
                      align="center"
                      sx={{ py: 5 }}
                    >
                      <Typography variant="subtitle1">
                        {totalUsers > 0 && searchTerm
                          ? "No users match your search criteria."
                          : "No users found."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!tableLoading &&
                  displayUsers.map((user) => (
                    <UserTableRowComponent
                      key={user.id}
                      user={user}
                      isSelected={selectedIds.includes(user.id)}
                      onCheckboxClick={(event) =>
                        handleRowCheckboxClick(event, user.id)
                      }
                      onMenuOpen={(event) => handleOpenUserMenu(event, user)}
                      headCells={defaultHeadCells}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={currentPage}
            onPageChange={(_event, newPage) => handleChangePage(newPage)}
            onRowsPerPageChange={(event) =>
              handleChangeRowsPerPage(parseInt(event.target.value, 10))
            }
            sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
          />
        </Paper>

        {isUserDetailDialogOpen && (
          <UserEditViewDialog
            open={isUserDetailDialogOpen}
            onClose={handleCloseUserDetailDialog}
            user={userToEditView}
            isCreatingNewUser={isCreatingNewUserFlow}
            getSubscriptionStatusInfo={getSubscriptionStatusInfo}
            getChipColorFromSemanticStatus={() => "default"}
          />
        )}

        <Menu
          anchorEl={userMenuAnchorEl}
          open={Boolean(userMenuAnchorEl)}
          onClose={handleCloseUserMenu}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => {
              if (selectedUserForMenu) {
                handleOpenUserDetailDialog(selectedUserForMenu, false);
              }
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> View / Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleOpenDeleteConfirmDialog();
            }}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() =>
            !deleteUserMutation.isPending && setOpenDeleteDialog(false)
          }
          maxWidth="xs"
        >
          <DialogTitle>
            <Typography variant="h6">Confirm Deletion</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user "
              {selectedUserForMenu?.username || "this user"}"? This action
              cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              color="inherit"
              disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteUser}
              color="error"
              variant="contained"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog
          open={openBulkDeleteDialog}
          onClose={() =>
            !bulkDeleteUsersMutation.isPending && setOpenBulkDeleteDialog(false)
          }
          maxWidth="xs"
        >
          <DialogTitle>
            <Typography variant="h6">Confirm Bulk Deletion</Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedIds.length} selected
              user(s)? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenBulkDeleteDialog(false)}
              color="inherit"
              disabled={bulkDeleteUsersMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={executeBulkDelete}
              color="error"
              variant="contained"
              disabled={bulkDeleteUsersMutation.isPending}
            >
              {bulkDeleteUsersMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete Selected"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Page-level Snackbar for notifications like delete success/failure */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handlePageSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <PageSnackbarAlert
          onClose={handlePageSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </PageSnackbarAlert>
      </Snackbar>
    </>
  );
};

export default UserManagementPage;
