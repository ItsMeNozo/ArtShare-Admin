import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "./utils/userTable.utils";
import { defaultHeadCells } from "./constants/userTable.constants";

import { UserEditViewDialog } from "./components/UserEditViewDialog";
import { UserTableToolbar } from "./components/UserTableToolbar";
import { UserTableHeadComponent } from "./components/UserTableHeadComponent";
import { UserTableRowComponent } from "./components/UserTableRowComponent";

import { useUserOperations, UserOperations } from "./hooks/useUserOperations";

interface DisplayUser extends User {
  currentPlan?: string;
}

const UserManagementPage: React.FC = () => {
  const theme = useTheme();
  const {
    users,
    loading: crudLoading,
    error: crudError,

    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    clearError,
    setErrorManually,

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
  }: UserOperations = useUserOperations();

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
      setErrorManually("User ID is missing for update.");
      throw new Error("User ID is required for update.");
    }
    if (!updateUser) {
      setErrorManually("Update function not available.");
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
      await deleteUser(selectedUserForMenu.id);
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

  const displayUsers: DisplayUser[] = useMemo(() => {
    return users.map((user) => {
      const statusInfo = getSubscriptionStatusInfo(user);
      return {
        ...user,
        currentPlan: getCurrentEffectivePlanNameForTable(user, statusInfo),
      };
    });
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

  if (crudLoading && users.length === 0 && !searchTerm) {
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

        {crudError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
            {crudError}
          </Alert>
        )}

        {crudLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress size={24} />
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
              onRequestSort={(_event, property) => handleSortRequest(property)}
              onSelectAllClick={handleSelectAllClickOnPage}
              numSelected={
                selectedIds.filter((id) =>
                  displayUsers.some((u) => u.id === id),
                ).length
              }
              rowCount={displayUsers.length}
            />
            <TableBody>
              {!crudLoading && displayUsers.length === 0 && (
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
              {!crudLoading &&
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

      {/* Delete Confirmation Dialog */}
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
            disabled={crudLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={crudLoading}
          >
            {crudLoading && selectedUserForMenu ? (
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
            disabled={crudLoading}
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
