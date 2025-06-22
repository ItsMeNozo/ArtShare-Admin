import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Alert,
  Snackbar,
  AlertColor,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as UnsuspendIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useUserOperations } from "./hooks/useUserOperations";
import { UserTableToolbar } from "./components/UserTableToolbar";
import { UserEditViewDialog } from "./components/UserEditViewDialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { User, UserFormData } from "../../types/user";
import { UserStatus } from "../../constants/user";
import { UserRoleType } from "../../constants/roles";
import {
  getSubscriptionStatusInfo,
  getCurrentEffectivePlanNameForTable,
  getStatusChipProps,
  getPrimaryRole,
} from "./utils/userTable.utils";
import { DisplayUser } from "./types";

const UserManagementPage: React.FC = () => {
  const theme = useTheme();
  // Use the UserOperations hook
  const {
    users,
    loading: crudLoading,
    error: crudError,
    totalUsers,
    currentPage,
    rowsPerPage,
    searchTerm,
    statusFilter,
    roleFilter,
    deleteUser,
    bulkDeleteUsers,
    clearError,
    setErrorManually,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    handleStatusFilterChange,
    handleRoleFilterChange,
    updateUser,
  } = useUserOperations();

  // Local state for UI interactions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);
  const [userToEditView, setUserToEditView] = useState<User | null>(null);
  const [isCreatingNewUserFlow, setIsCreatingNewUserFlow] = useState(false);

  // Menu state
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedUserForMenu, setSelectedUserForMenu] = useState<User | null>(
    null,
  );

  // Dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("info");

  // Transform users to display format
  const displayUsers: DisplayUser[] = useMemo(() => {
    return users.map((user) => {
      const statusInfo = getSubscriptionStatusInfo(user);
      return {
        ...user,
        currentPlan: getCurrentEffectivePlanNameForTable(user, statusInfo),
      };
    });
  }, [users]);

  // CSV and PDF export data
  const getDataForExport = () => {
    return selectedIds.length > 0
      ? displayUsers.filter((u) => selectedIds.includes(u.id))
      : displayUsers;
  };

  const csvFormattedData = useMemo(() => {
    const dataToExport = getDataForExport();
    return dataToExport.map((user) => ({
      Username: user.username,
      FullName: user.fullName || "",
      Email: user.email,
      Role: getPrimaryRole(user.roles),
      "Current Plan": user.currentPlan || "N/A",
      "Joined Date": user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",
    }));
  }, [displayUsers, selectedIds]);

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");
    const dataToExport = getDataForExport();
    const pdfData = dataToExport.map((user) => [
      user.username ?? "",
      user.fullName ?? "",
      user.email ?? "",
      getPrimaryRole(user.roles),
      user.currentPlan ?? "N/A",
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
    ]);
    autoTable(doc, {
      head: [
        [
          "Username",
          "Full Name",
          "Email",
          "Role",
          "Current Plan",
          "Joined Date",
        ],
      ],
      body: pdfData,
    });
    doc.save("users-page.pdf");
  };

  // Selection helpers
  const resetSelection = () => setSelectedIds([]);

  // Handle row selection
  const handleRowSelect = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Handle select all
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(displayUsers.map((user) => user.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Menu handlers
  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    user: User,
  ) => {
    setUserMenuAnchorEl(event.currentTarget);
    setSelectedUserForMenu(user);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchorEl(null);
    setSelectedUserForMenu(null);
  };

  // Dialog handlers
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

  // User save handler
  const handleSaveUserFromDialog = async (
    dataForBackend: UserFormData,
    userIdToUpdate?: string,
  ): Promise<User> => {
    clearError();

    if (!userIdToUpdate) {
      setErrorManually("User ID is missing for update operation.");
      throw new Error("User ID is required for update.");
    }

    if (!updateUser) {
      setErrorManually("Update function not available.");
      throw new Error("Update user function from hook is not available.");
    }

    const { password, id, ...updatePayloadData } = dataForBackend;

    try {
      const updatedUser = await updateUser(
        userIdToUpdate,
        updatePayloadData as Omit<UserFormData, "id" | "password">,
      );
      if (!updatedUser) {
        throw new Error(
          "Failed to update user (operation returned undefined).",
        );
      }
      return updatedUser;
    } catch (error) {
      console.error("Error in handleSaveUserFromDialog:", error);
      if (error instanceof Error) {
        setErrorManually(error.message);
      } else {
        setErrorManually("An unknown error occurred while saving user.");
      }
      throw error;
    }
  };

  // Delete handlers
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
    handleCloseUserMenu();
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForMenu?.id) return;

    try {
      const success = await deleteUser(selectedUserForMenu.id);
      if (success) {
        showPageNotification("User deleted successfully.", "success");
      }
    } catch (err) {
      showPageNotification("Failed to delete user.", "error");
    } finally {
      setOpenDeleteDialog(false);
      setSelectedUserForMenu(null);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      const result = await bulkDeleteUsers(selectedIds);
      showPageNotification(
        `${result.successCount} user(s) deleted successfully.`,
        "success",
      );
      resetSelection();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showPageNotification("Failed to delete users.", "error");
    } finally {
      setOpenBulkDeleteDialog(false);
    }
  };

  // Suspend handler
  const handleSuspendUser = async () => {
    if (!selectedUserForMenu?.id) return;

    try {
      const currentUser = selectedUserForMenu;

      // Check if user is already suspended
      if (currentUser.status === UserStatus.SUSPENDED) {
        showPageNotification("User is already suspended.", "warning");
        handleCloseUserMenu();
        return;
      }

      // Update user status to SUSPENDED
      const userData = {
        username: currentUser.username,
        email: currentUser.email,
        fullName: currentUser.fullName,
        profilePictureUrl: currentUser.profilePictureUrl,
        bio: currentUser.bio,
        birthday: currentUser.birthday,
        roles: currentUser.roles,
        status: UserStatus.SUSPENDED,
      };

      await updateUser(currentUser.id, userData);
      showPageNotification("User suspended successfully.", "success");
    } catch (err) {
      console.error("Suspend user failed:", err);
      showPageNotification("Failed to suspend user.", "error");
    } finally {
      handleCloseUserMenu();
    }
  };

  // Unsuspend handler
  const handleUnsuspendUser = async () => {
    if (!selectedUserForMenu?.id) return;

    try {
      const currentUser = selectedUserForMenu;

      // Check if user is not suspended
      if (currentUser.status !== UserStatus.SUSPENDED) {
        showPageNotification("User is not suspended.", "warning");
        handleCloseUserMenu();
        return;
      }

      // Update user status to ACTIVE
      const userData = {
        username: currentUser.username,
        email: currentUser.email,
        fullName: currentUser.fullName,
        profilePictureUrl: currentUser.profilePictureUrl,
        bio: currentUser.bio,
        birthday: currentUser.birthday,
        roles: currentUser.roles,
        status: UserStatus.ACTIVE,
      };

      await updateUser(currentUser.id, userData);
      showPageNotification("User unsuspended successfully.", "success");
    } catch (err) {
      console.error("Unsuspend user failed:", err);
      showPageNotification("Failed to unsuspend user.", "error");
    } finally {
      handleCloseUserMenu();
    }
  };

  // Notification helpers
  const showPageNotification = (message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handlePageSnackbarClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

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
        }}
      ></Box>{" "}
      <UserTableToolbar
        searchTerm={searchTerm}
        onSearchChange={(event) => handleSearchChange(event.target.value)}
        statusFilter={statusFilter}
        onStatusFilterChange={(event) =>
          handleStatusFilterChange(event.target.value as UserStatus | "ALL")
        }
        roleFilter={roleFilter}
        onRoleFilterChange={(event) =>
          handleRoleFilterChange(event.target.value as UserRoleType | "ALL")
        }
        onAddUser={() => handleOpenUserDetailDialog(null, true)}
        selectedIdsCount={selectedIds.length}
        onBulkDelete={() => setOpenBulkDeleteDialog(true)}
        onDeselectAll={resetSelection}
        onExportPDF={handleExportPDF}
        csvFormattedData={csvFormattedData}
        theme={theme}
      />
      {crudError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {crudError}
        </Alert>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < displayUsers.length
                  }
                  checked={
                    displayUsers.length > 0 &&
                    selectedIds.length === displayUsers.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Avatar</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Plan</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {crudLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : displayUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <Typography variant="subtitle1">
                    {searchTerm
                      ? "No users match your search criteria."
                      : "No users available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayUsers.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                const statusChipProps = getStatusChipProps(user.status);

                return (
                  <TableRow key={user.id} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleRowSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar src={user.profilePictureUrl || undefined}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.fullName || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={getPrimaryRole(user.roles)}
                        size="small"
                        color={
                          getPrimaryRole(user.roles) === "ADMIN"
                            ? "secondary"
                            : "default"
                        }
                        sx={{ mr: 0.5 }}
                      />
                    </TableCell>{" "}
                    <TableCell>
                      <Chip
                        label={statusChipProps.label}
                        color={statusChipProps.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.currentPlan}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(event) => handleOpenUserMenu(event, user)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={(_, newPage) => handleChangePage(newPage)}
        onRowsPerPageChange={(event) =>
          handleChangeRowsPerPage(Number(event.target.value))
        }
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
      />
      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem
          onClick={() => handleOpenUserDetailDialog(selectedUserForMenu, false)}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {/* Conditional Suspend/Unsuspend based on current status */}
        {selectedUserForMenu?.status === UserStatus.SUSPENDED ? (
          <MenuItem
            onClick={handleUnsuspendUser}
            sx={{ color: "success.main" }}
          >
            <UnsuspendIcon fontSize="small" sx={{ mr: 1 }} />
            Unsuspend User
          </MenuItem>
        ) : (
          <MenuItem onClick={handleSuspendUser} sx={{ color: "warning.main" }}>
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            Suspend User
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenDeleteDialog} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user "{selectedUserForMenu?.username}
          "? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Bulk Delete Dialog */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
      >
        <DialogTitle>Confirm Bulk Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedIds.length} selected user(s)?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkDelete} color="error" variant="contained">
            Delete Selected
          </Button>
        </DialogActions>
      </Dialog>
      {/* User Edit Dialog */}
      {isUserDetailDialogOpen && (
        <UserEditViewDialog
          open={isUserDetailDialogOpen}
          onClose={handleCloseUserDetailDialog}
          user={userToEditView}
          isCreatingNewUser={isCreatingNewUserFlow}
          onSave={handleSaveUserFromDialog}
          getSubscriptionStatusInfo={getSubscriptionStatusInfo}
          getChipColorFromSemanticStatus={() => "default"}
        />
      )}
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handlePageSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handlePageSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UserManagementPage;
