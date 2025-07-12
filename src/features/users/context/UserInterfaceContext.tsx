import { AlertColor } from '@mui/material/Alert';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { User } from '../../../types/user';

interface DialogsState {
  editView: { open: boolean; user: User | null; isCreating: boolean };
  delete: { open: boolean; user: User | null };
  bulkDelete: { open: boolean };
}

interface UserInterfaceContextType {
  selectedIds: string[];
  handleRowCheckboxClick: (id: string) => void;
  handleSelectAllClickOnPage: (
    event: React.ChangeEvent<HTMLInputElement>,
    userIdsOnPage: string[],
  ) => void;
  resetSelection: () => void;

  userMenu: { anchorEl: null | HTMLElement; user: null | User };
  handleOpenUserMenu: (
    event: React.MouseEvent<HTMLElement>,
    user: User,
  ) => void;
  handleCloseUserMenu: () => void;

  dialogs: DialogsState;
  handleOpenUserDetailDialog: (user: User | null, isCreating?: boolean) => void;
  handleCloseUserDetailDialog: () => void;
  handleOpenDeleteConfirmDialog: (user?: User) => void;
  handleCloseDeleteDialog: () => void;
  handleOpenBulkDeleteDialog: () => void;
  handleCloseBulkDeleteDialog: () => void;

  snackbar: { open: boolean; message: string; severity: AlertColor };
  showPageNotification: (message: string, severity: AlertColor) => void;
  handlePageSnackbarClose: (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => void;
}

const UserInterfaceContext = createContext<
  UserInterfaceContextType | undefined
>(undefined);

export const UserInterfaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const resetSelection = useCallback(() => setSelectedIds([]), []);

  const [userMenu, setUserMenu] = useState<{
    anchorEl: null | HTMLElement;
    user: null | User;
  }>({
    anchorEl: null,
    user: null,
  });

  const [dialogs, setDialogs] = useState<DialogsState>({
    editView: { open: false, user: null, isCreating: false },
    delete: { open: false, user: null },
    bulkDelete: { open: false },
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showPageNotification = useCallback(
    (message: string, severity: AlertColor) => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const handlePageSnackbarClose = useCallback(
    (_?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return;
      setSnackbar((prev) => ({ ...prev, open: false }));
    },
    [],
  );

  const handleOpenUserMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, user: User) => {
      setUserMenu({ anchorEl: event.currentTarget, user });
    },
    [],
  );

  const handleCloseUserMenu = useCallback(
    () => setUserMenu({ anchorEl: null, user: null }),
    [],
  );

  const handleOpenUserDetailDialog = useCallback(
    (user: User | null, isCreating = false) => {
      setDialogs((d) => ({ ...d, editView: { open: true, user, isCreating } }));
      handleCloseUserMenu();
    },
    [handleCloseUserMenu],
  );

  const handleCloseUserDetailDialog = useCallback(() => {
    setDialogs((d) => ({ ...d, editView: { ...d.editView, open: false } }));
  }, []);

  const handleOpenDeleteConfirmDialog = useCallback(
    (userFromMenu?: User) => {
      const userToDelete = userFromMenu || userMenu.user;
      if (userToDelete) {
        setDialogs((d) => ({
          ...d,
          delete: { open: true, user: userToDelete },
        }));
      }
      handleCloseUserMenu();
    },
    [userMenu.user, handleCloseUserMenu],
  );

  const handleCloseDeleteDialog = useCallback(() => {
    setDialogs((d) => ({ ...d, delete: { ...d.delete, open: false } }));
  }, []);

  const handleOpenBulkDeleteDialog = useCallback(() => {
    if (selectedIds.length > 0) {
      setDialogs((d) => ({ ...d, bulkDelete: { open: true } }));
    } else {
      showPageNotification('No users selected for bulk deletion.', 'info');
    }
  }, [selectedIds.length, showPageNotification]);

  const handleCloseBulkDeleteDialog = useCallback(() => {
    setDialogs((d) => ({ ...d, bulkDelete: { ...d.bulkDelete, open: false } }));
  }, []);

  const handleRowCheckboxClick = useCallback((id: string) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id],
    );
  }, []);

  const handleSelectAllClickOnPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, userIdsOnPage: string[]) => {
      if (event.target.checked) {
        const idsToAdd = userIdsOnPage.filter(
          (id) => !selectedIds.includes(id),
        );
        setSelectedIds((prev) => [...prev, ...idsToAdd]);
      } else {
        setSelectedIds((prev) =>
          prev.filter((id) => !userIdsOnPage.includes(id)),
        );
      }
    },
    [selectedIds],
  );

  const value = {
    selectedIds,
    handleRowCheckboxClick,
    handleSelectAllClickOnPage,
    resetSelection,
    userMenu,
    handleOpenUserMenu,
    handleCloseUserMenu,
    dialogs,
    handleOpenUserDetailDialog,
    handleCloseUserDetailDialog,
    handleOpenDeleteConfirmDialog,
    handleCloseDeleteDialog,
    handleOpenBulkDeleteDialog,
    handleCloseBulkDeleteDialog,
    snackbar,
    showPageNotification,
    handlePageSnackbarClose,
  };

  return (
    <UserInterfaceContext.Provider value={value}>
      {children}
    </UserInterfaceContext.Provider>
  );
};

export const useUserInterface = (): UserInterfaceContextType => {
  const context = useContext(UserInterfaceContext);
  if (context === undefined) {
    throw new Error(
      'useUserInterface must be used within a UserInterfaceProvider',
    );
  }
  return context;
};
