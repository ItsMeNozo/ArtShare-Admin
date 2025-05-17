import React, { useState, useEffect, useMemo } from "react";
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
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

import { User, UserFormData } from "../../types/user";
import {
  getSubscriptionStatusInfo,
  getCurrentEffectivePlanNameForTable,
  stableSort,
  getComparator,
} from "./utils/userTable.utils";
import { headCells as defaultHeadCells } from "./constants/userTable.constants";
import { SortableUser } from "./types";

import { UserEditViewDialog } from "./components/UserEditViewDialog";
import { UserTableToolbar } from "./components/UserTableToolbar";
import { UserTableHeadComponent } from "./components/UserTableHeadComponent";
import { UserTableRowComponent } from "./components/UserTableRowComponent";

import { useUserTableControls } from "./hooks/useUserTableControls";
import { useUserOperations } from "./hooks/useUserOperations";

const UserManagementPage: React.FC = () => {
  const theme = useTheme();
  const {
    users,
    loading: crudLoading,
    error: crudError,
    loadUsers,
    deleteUser,
    bulkDeleteUsers,
    clearError,
    setErrorManually,
    updateUser,
  } = useUserOperations();

  const {
    page,
    rowsPerPage,
    searchTerm,
    order,
    orderBy,
    selectedIds,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    handleRequestSort,
    handleSelectAllClick,
    handleRowCheckboxClick,
    resetSelection,
  } = useUserTableControls("username");

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

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenUserMenu = (
    event: React.MouseEvent<HTMLElement>,
    user: User,
  ) => {
    setUserMenuAnchorEl(event.currentTarget);
    setSelectedUserForMenu(user);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchorEl(null);
  };

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
      setSelectedUserForMenu(null);
    }, 150);
  };

  const handleSaveUserFromDialog = async (
    dataForBackend: UserFormData,
    userIdToUpdate?: string,
  ): Promise<User> => {
    clearError();

    if (!userIdToUpdate) {
      throw new Error("User ID is required for update.");
    }

    if (!updateUser) {
      throw new Error("Update user function from hook is not available.");
    }

    const { password, id, ...updatePayloadData } = dataForBackend;

    const updatedUser = await updateUser(
      userIdToUpdate,
      updatePayloadData as Omit<UserFormData, "id" | "password">,
    );
    if (!updatedUser) {
      throw new Error("Failed to update user (operation returned undefined).");
    }

    return updatedUser;
  };

  const handleOpenDeleteConfirmDialog = (userFromMenu?: User) => {
    const userToDelete = userFromMenu || selectedUserForMenu;
    if (userToDelete) {
      setSelectedUserForMenu(userToDelete);
      setOpenDeleteDialog(true);
    }
    handleCloseUserMenu();
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForMenu || !selectedUserForMenu.id) {
      setErrorManually("Cannot delete user: User data is missing.");
      setOpenDeleteDialog(false);
      setSelectedUserForMenu(null);
      return;
    }
    clearError();
    try {
      await deleteUser(selectedUserForMenu.id as string);
    } catch (err) {
      console.error("Delete user failed from page:", err);
    } finally {
      setOpenDeleteDialog(false);
      setSelectedUserForMenu(null);
    }
  };

  const handleInitiateBulkDelete = () => {
    if (selectedIds.length > 0) {
      setOpenBulkDeleteDialog(true);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    clearError();
    try {
      await bulkDeleteUsers(selectedIds);

      resetSelection();
    } catch (err) {
      console.error("Bulk delete failed from page:", err);
    } finally {
      setOpenBulkDeleteDialog(false);
    }
  };

  const processedUsers = useMemo(() => {
    const filteredUsers = users.filter(
      (user) =>
        (user.username || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const augmentedUsers: SortableUser[] = filteredUsers.map((user) => {
      const statusInfo = getSubscriptionStatusInfo(user);
      return {
        ...user,
        currentPlan: getCurrentEffectivePlanNameForTable(user, statusInfo),
        createdAt_sortable: new Date(user.createdAt).toISOString(),
      };
    });
    return stableSort(augmentedUsers, getComparator(order, orderBy));
  }, [users, searchTerm, order, orderBy]);

  const paginatedUsers = useMemo(
    () =>
      processedUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [processedUsers, page, rowsPerPage],
  );

  const csvFormattedData = useMemo(() => {
    const dataToExport =
      selectedIds.length > 0
        ? processedUsers.filter((u) => selectedIds.includes(u.id))
        : processedUsers;
    return dataToExport.map((user) => ({
      Username: user.username,
      FullName: user.fullName || "",
      Email: user.email,
      Roles: user.roles.map((r) => r).join(" | "),
      "Current Plan": user.currentPlan,
      "Joined Date": new Date(user.createdAt).toLocaleDateString(),
    }));
  }, [processedUsers, selectedIds]);

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");
    const pdfData = (
      selectedIds.length > 0
        ? processedUsers.filter((u) => selectedIds.includes(u.id))
        : processedUsers
    ).map((user) => [
      user.username ?? "",
      user.fullName ?? "",
      user.email ?? "",
      user.roles.map((r) => r).join(", "),
      user.currentPlan ?? "N/A",
      new Date(user.createdAt).toLocaleDateString(),
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
    doc.save("users.pdf");
  };

  if (crudLoading && users.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
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
          onSearchChange={handleSearchChange}
          onAddUser={() => handleOpenUserDetailDialog(null, true)}
          selectedIdsCount={selectedIds.length}
          onBulkDelete={handleInitiateBulkDelete}
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

        {crudLoading && users.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <TableContainer sx={{ boxShadow: "none" }}>
          <Table sx={{ minWidth: 750 }} aria-label="user management table">
            <UserTableHeadComponent
              headCells={defaultHeadCells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              onSelectAllClick={(_event) => {
                const currentVisibleUserIds = paginatedUsers.map((u) => u.id);
                handleSelectAllClick(_event as any, currentVisibleUserIds);
              }}
              numSelected={
                selectedIds.filter((id) =>
                  paginatedUsers.some((u) => u.id === id),
                ).length
              }
              rowCount={paginatedUsers.length}
            />
            <TableBody>
              {paginatedUsers.length === 0 && !crudLoading && (
                <TableRow>
                  <TableCell
                    colSpan={defaultHeadCells.length + 1}
                    align="center"
                    sx={{ py: 5 }}
                  >
                    <Typography variant="subtitle1">No users found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {paginatedUsers.map((user) => (
                <UserTableRowComponent
                  key={user.id}
                  user={user}
                  isSelected={selectedIds.includes(user.id)}
                  onCheckboxClick={(event) =>
                    handleRowCheckboxClick(event, user.id)
                  }
                  onMenuOpen={handleOpenUserMenu}
                  headCells={defaultHeadCells}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={processedUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 2, borderTop: `1px solid ${theme.palette.divider}` }}
        />
      </Paper>

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

      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setSelectedUserForMenu(null);
        }}
        maxWidth="xs"
      >
        <DialogTitle>
          <Typography variant="h6">Confirm Deletion</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "
            {selectedUserForMenu?.username || "this user"}"? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setSelectedUserForMenu(null);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={crudLoading}
          >
            {crudLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openBulkDeleteDialog}
        onClose={() => setOpenBulkDeleteDialog(false)}
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
          >
            Cancel
          </Button>
          <Button
            onClick={executeBulkDelete}
            color="error"
            variant="contained"
            disabled={crudLoading}
          >
            {crudLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete Selected"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;
