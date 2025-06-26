import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertColor } from '@mui/material';
import { Category } from '../../../types/category';

interface DialogsState {
  editView: { open: boolean; category: Category | null; isCreating: boolean };
  delete: { open: boolean; category: Category | null };
  bulkDelete: { open: boolean };
}

interface CategoryInterfaceContextType {
  selectedIds: number[];
  handleRowCheckboxClick: (id: number) => void;
  handleSelectAllClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    categoryIds: number[],
  ) => void;
  resetSelection: () => void;

  dialogs: DialogsState;
  handleOpenCategoryDetailDialog: (
    category: Category | null,
    isCreating?: boolean,
  ) => void;
  handleCloseCategoryDetailDialog: () => void;
  handleOpenDeleteConfirmDialog: (category?: Category) => void;
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

const CategoryInterfaceContext = createContext<
  CategoryInterfaceContextType | undefined
>(undefined);

export const CategoryInterfaceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const resetSelection = useCallback(() => setSelectedIds([]), []);

  const [dialogs, setDialogs] = useState<DialogsState>({
    editView: { open: false, category: null, isCreating: false },
    delete: { open: false, category: null },
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

  // Selection handlers
  const handleRowCheckboxClick = useCallback((id: number) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id],
    );
  }, []);

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, categoryIds: number[]) => {
      if (event.target.checked) {
        setSelectedIds(categoryIds);
      } else {
        setSelectedIds([]);
      }
    },
    [],
  );

  // Dialog handlers
  const handleOpenCategoryDetailDialog = useCallback(
    (category: Category | null, isCreating = false) => {
      setDialogs((prev) => ({
        ...prev,
        editView: { open: true, category, isCreating },
      }));
    },
    [],
  );

  const handleCloseCategoryDetailDialog = useCallback(() => {
    setDialogs((prev) => ({
      ...prev,
      editView: { open: false, category: null, isCreating: false },
    }));
  }, []);

  const handleOpenDeleteConfirmDialog = useCallback((category?: Category) => {
    setDialogs((prev) => ({
      ...prev,
      delete: { open: true, category: category || null },
    }));
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDialogs((prev) => ({
      ...prev,
      delete: { open: false, category: null },
    }));
  }, []);

  const handleOpenBulkDeleteDialog = useCallback(() => {
    setDialogs((prev) => ({
      ...prev,
      bulkDelete: { open: true },
    }));
  }, []);

  const handleCloseBulkDeleteDialog = useCallback(() => {
    setDialogs((prev) => ({
      ...prev,
      bulkDelete: { open: false },
    }));
  }, []);

  const value = {
    selectedIds,
    handleRowCheckboxClick,
    handleSelectAllClick,
    resetSelection,
    dialogs,
    handleOpenCategoryDetailDialog,
    handleCloseCategoryDetailDialog,
    handleOpenDeleteConfirmDialog,
    handleCloseDeleteDialog,
    handleOpenBulkDeleteDialog,
    handleCloseBulkDeleteDialog,
    snackbar,
    showPageNotification,
    handlePageSnackbarClose,
  };

  return (
    <CategoryInterfaceContext.Provider value={value}>
      {children}
    </CategoryInterfaceContext.Provider>
  );
};

export const useCategoryInterface = (): CategoryInterfaceContextType => {
  const context = useContext(CategoryInterfaceContext);
  if (context === undefined) {
    throw new Error(
      'useCategoryInterface must be used within a CategoryInterfaceProvider',
    );
  }
  return context;
};
