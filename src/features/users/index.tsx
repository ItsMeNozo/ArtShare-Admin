import React, { useState, useEffect, ChangeEvent, useMemo } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Avatar,
  Chip,
  ChipProps,
  TableSortLabel,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { User, UserFormData } from "../../types/user";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "./mocks/user.api";
import { PaidAccessLevel, PLAN_DISPLAY_NAMES } from "../../constants/plan";
import { UserEditViewDialog } from "./components/UserEditViewDialog";
import { visuallyHidden } from "@mui/utils";

export type SemanticSubscriptionStatus =
  | "active"
  | "active_free"
  | "cancels_soon"
  | "admin_na"
  | "no_plan";

export interface SubscriptionStatusInfo {
  text: string;
  semantic: SemanticSubscriptionStatus;
}

function getPlanDisplayName(
  planId: PaidAccessLevel | string | null | undefined,
): string {
  if (
    !planId ||
    !Object.values(PaidAccessLevel).includes(planId as PaidAccessLevel)
  ) {
    return "N/A";
  }
  return PLAN_DISPLAY_NAMES[planId as PaidAccessLevel] || "Unknown Plan";
}

const getSubscriptionStatusInfo = (
  user: User | null,
): SubscriptionStatusInfo => {
  if (!user) {
    return { text: "N/A", semantic: "no_plan" };
  }

  if (user.roles.some((r) => r.role.role_name === "ADMIN")) {
    return { text: "N/A (Admin)", semantic: "admin_na" };
  }

  if (!user.userAccess) {
    return {
      text: getPlanDisplayName(PaidAccessLevel.FREE),
      semantic: "active_free",
    };
  }

  const { expiresAt, cancelAtPeriodEnd, planId } = user.userAccess;
  const now = new Date();

  if (planId !== PaidAccessLevel.FREE && new Date(expiresAt) < now) {
    return {
      text: `${getPlanDisplayName(PaidAccessLevel.FREE)} (Expired: ${getPlanDisplayName(planId)})`,
      semantic: "active_free",
    };
  }

  if (planId === PaidAccessLevel.FREE) {
    return { text: getPlanDisplayName(planId), semantic: "active_free" };
  }

  if (cancelAtPeriodEnd) {
    return {
      text: `${getPlanDisplayName(planId)} (Cancels at period end)`,
      semantic: "cancels_soon",
    };
  }

  return { text: getPlanDisplayName(planId), semantic: "active" };
};

const getCurrentEffectivePlanNameForTable = (
  user: User | null,
  statusInfo: SubscriptionStatusInfo,
): string => {
  if (!user || statusInfo.semantic === "admin_na") {
    return "N/A";
  }
  if (
    statusInfo.semantic === "no_plan" ||
    statusInfo.semantic === "active_free"
  ) {
    return getPlanDisplayName(PaidAccessLevel.FREE);
  }

  if (user.userAccess) {
    return getPlanDisplayName(user.userAccess.planId);
  }
  return getPlanDisplayName(PaidAccessLevel.FREE);
};

const getChipColorFromSemanticStatus = (
  status: SemanticSubscriptionStatus,
): ChipProps["color"] => {
  switch (status) {
    case "active":
    case "active_free":
      return "success";
    case "cancels_soon":
      return "warning";
    case "admin_na":
    case "no_plan":
    default:
      return "default";
  }
};

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const valA = a[orderBy];
  const valB = b[orderBy];

  if (valB == null && valA != null) return -1;
  if (valA == null && valB != null) return 1;
  if (valB == null && valA == null) return 0;

  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

type Order = "asc" | "desc";

type SortableUser = User & {
  currentPlan?: string;
  created_at_sortable?: string;
};

function getComparator<Key extends keyof SortableUser>(
  order: Order,
  orderBy: Key,
): (a: SortableUser, b: SortableUser) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

type UserSortableKeys =
  | "username"
  | "email"
  | "currentPlan"
  | "created_at_sortable";

interface HeadCell {
  id: UserSortableKeys | "avatar" | "roles" | "actions";
  label: string;
  numeric: boolean;
  sortable: boolean;
  minWidth?: number | string;
  align?: "left" | "right" | "center";
  disablePadding?: boolean;
  className?: string;
}

const headCells: readonly HeadCell[] = [
  {
    id: "avatar",
    numeric: false,
    sortable: false,
    label: "Avatar",
    minWidth: 60,
    align: "left",
  },
  {
    id: "username",
    numeric: false,
    sortable: true,
    label: "Username",
    minWidth: 150,
    align: "left",
  },
  {
    id: "email",
    numeric: false,
    sortable: true,
    label: "Email",
    minWidth: 170,
    align: "left",
    className: "hidden md:table-cell",
  },
  {
    id: "roles",
    numeric: false,
    sortable: false,
    label: "Roles",
    minWidth: 120,
    align: "left",
  },
  {
    id: "currentPlan",
    numeric: false,
    sortable: true,
    label: "Current Plan",
    minWidth: 150,
    align: "left",
  },

  {
    id: "actions",
    numeric: false,
    sortable: false,
    label: "Actions",
    minWidth: 50,
    align: "center",
  },
];

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserForMenu, setSelectedUserForMenu] = useState<User | null>(
    null,
  );

  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<UserSortableKeys>("username");

  const [userToEditView, setUserToEditView] = useState<User | null>(null);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] =
    useState<boolean>(false);
  const [isCreatingNewUserFlow, setIsCreatingNewUserFlow] =
    useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to fetch users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserForMenu(user);
  };

  const handleOpenUserDetailDialog = (
    user: User | null,
    isCreating: boolean = false,
  ) => {
    console.log(
      "handleOpenUserDetailDialog called with user:",
      user?.username,
      "isCreating:",
      isCreating,
    );
    setUserToEditView(user);
    setIsCreatingNewUserFlow(isCreating);
    setIsUserDetailDialogOpen(true);
  };

  const handleCloseUserDetailDialog = () => {
    setIsUserDetailDialogOpen(false);

    setTimeout(() => {
      setUserToEditView(null);
      setIsCreatingNewUserFlow(false);
      setSelectedUserForMenu(null);
      console.log(
        "handleCloseUserDetailDialog: Cleared userToEditView and selectedUserForMenu",
      );
    }, 150);
  };

  const handleSaveUserFromDialog = async (
    formData: UserFormData,
    userIdToUpdate?: String,
  ) => {
    if (isCreatingNewUserFlow || !userIdToUpdate) {
      await createUser(formData);
    } else {
      await updateUser(userIdToUpdate, formData);
    }
    await loadUsers();
    if (isCreatingNewUserFlow) {
      handleCloseUserDetailDialog();
    }
  };

  const handleOpenDeleteConfirmDialog = (userFromMenu: User) => {
    console.log(
      "handleOpenDeleteConfirmDialog: Received user from menu:",
      userFromMenu.username,
      "ID:",
      userFromMenu.id,
    );
    setSelectedUserForMenu(userFromMenu);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    console.log(
      "handleDeleteUser called. selectedUserForMenu:",
      selectedUserForMenu?.username,
      "ID:",
      selectedUserForMenu?.id,
    );

    if (!selectedUserForMenu || !selectedUserForMenu.id) {
      console.error(
        "handleDeleteUser: selectedUserForMenu or its ID is missing!",
        selectedUserForMenu,
      );
      setError("Cannot delete user: User data is missing.");
      setOpenDeleteDialog(false);
      setSelectedUserForMenu(null);
      return;
    }

    try {
      console.log(
        `Attempting to delete user with ID: ${selectedUserForMenu.id}`,
      );
      const deleteSuccessful = await deleteUser(
        selectedUserForMenu.id as string,
      );
      console.log("deleteUser service call returned:", deleteSuccessful);

      if (deleteSuccessful) {
        console.log(
          "User deletion reported as successful by the service. Reloading users...",
        );
        await loadUsers();
        console.log("loadUsers completed after deletion.");
        setError(null);
      } else {
        console.error(
          "deleteUser service call returned false or an unexpected value.",
        );
        setError(
          "Failed to delete user: The operation did not complete successfully.",
        );
      }
    } catch (err) {
      console.error("Error during handleDeleteUser catch block:", err);
      setError("Failed to delete user. An error occurred.");
    } finally {
      console.log(
        "handleDeleteUser finally block: Closing delete dialog and clearing selectedUserForMenu.",
      );
      setOpenDeleteDialog(false);
      setSelectedUserForMenu(null);
    }
  };

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: UserSortableKeys,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const processedUsers = useMemo(() => {
    const filteredUsers = users.filter(
      (user) =>
        (user.username || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name &&
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    const augmentedUsers: SortableUser[] = filteredUsers.map((user) => {
      const statusInfo = getSubscriptionStatusInfo(user);
      return {
        ...user,

        currentPlan: getCurrentEffectivePlanNameForTable(
          user,
          statusInfo,
        ).toLowerCase(),
        created_at_sortable: new Date(user.created_at).toISOString(),
      };
    });

    return stableSort(augmentedUsers, getComparator(order, orderBy));
  }, [users, searchTerm, order, orderBy]);

  const paginatedUsers = processedUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (loading && users.length === 0)
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="xl" className="py-8 px-2 md:px-4">
      <Paper className="p-4 sm:p-6 shadow-xl">
        <Box className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <Typography
            variant="h4"
            component="h1"
            className="font-semibold flex-shrink-0"
          >
            User Management
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <TextField
              label="Search Users"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full sm:w-60 md:w-72"
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenUserDetailDialog(null, true)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              Add User
            </Button>
          </Box>
        </Box>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        {loading && users.length > 0 && (
          <Box className="flex justify-center mb-2">
            <CircularProgress size={24} />
          </Box>
        )}
        <TableContainer>
          <Table size="small">
            <TableHead className="bg-gray-50">
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align || "left"}
                    sortDirection={
                      orderBy === headCell.id && headCell.sortable
                        ? order
                        : false
                    }
                    className={headCell.className}
                    style={{ minWidth: headCell.minWidth }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={(event) =>
                          handleRequestSort(
                            event,
                            headCell.id as UserSortableKeys,
                          )
                        }
                      >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {order === "desc"
                              ? "sorted descending"
                              : "sorted ascending"}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={headCells.length}
                    align="center"
                    className="py-10"
                  >
                    <Typography variant="subtitle1">No users found.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {paginatedUsers.map((user) => {
                const userStatusInfo = getSubscriptionStatusInfo(user);

                return (
                  <TableRow key={user.id} hover className="group">
                    {/* Avatar */}
                    <TableCell>
                      <Avatar
                        src={user.profile_picture_url || undefined}
                        alt={user.username}
                        sx={{ width: 36, height: 36 }}
                      >
                        {(user.username || "U")[0]?.toUpperCase()}
                      </Avatar>
                    </TableCell>
                    {/* Username */}
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {user.username}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="text-gray-500 md:hidden"
                      >
                        {user.email}
                      </Typography>
                    </TableCell>
                    {/* Email (conditionally rendered) */}
                    {headCells
                      .find((hc) => hc.id === "email")
                      ?.className?.includes("md:table-cell") ? (
                      <TableCell className="hidden md:table-cell">
                        {user.email}
                      </TableCell>
                    ) : !headCells.find((hc) => hc.id === "email") ? null : (
                      <TableCell className="hidden md:table-cell"></TableCell>
                    )}
                    {/* Roles */}
                    <TableCell>
                      <Box className="flex flex-wrap gap-1">
                        {user.roles.map((userRole) => (
                          <Chip
                            key={userRole.role.role_id}
                            label={userRole.role.role_name}
                            size="small"
                            color={
                              userRole.role.role_name === "ADMIN"
                                ? "secondary"
                                : "default"
                            }
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    {/* Current Plan */}
                    <TableCell>
                      <Chip
                        label={user.currentPlan}
                        color={getChipColorFromSemanticStatus(
                          userStatusInfo.semantic,
                        )}
                        size="small"
                        variant={
                          userStatusInfo.semantic === "admin_na" ||
                          userStatusInfo.semantic === "no_plan"
                            ? "outlined"
                            : "filled"
                        }
                      />
                    </TableCell>
                    {/* Joined/Created At (conditionally rendered) - uncomment if you add this column
                    {headCells.find(hc => hc.id === 'created_at_sortable') ?
                        <TableCell className="hidden lg:table-cell">
                            {new Date(user.created_at).toLocaleDateString()}
                        </TableCell> : null
                    }
                    */}
                    {/* Actions */}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          handleMenuOpen(e, user as User);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          className="mt-4 border-t border-gray-200"
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
          getChipColorFromSemanticStatus={getChipColorFromSemanticStatus}
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            if (selectedUserForMenu) {
              handleOpenUserDetailDialog(selectedUserForMenu, false);
              setAnchorEl(null);
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> View / Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedUserForMenu) {
              handleOpenDeleteConfirmDialog(selectedUserForMenu);
              setAnchorEl(null);
            }
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog (standard MUI Dialog) */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagementPage;
