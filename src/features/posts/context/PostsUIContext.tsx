import { AlertColor } from '@mui/material/Alert';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { PostListItemDto } from '../types/post-api.types';

interface ConfirmationDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirmAction?: () => void;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface PostsUIContextType {
  selected: readonly number[];
  handleSelectRow: (
    event: React.MouseEvent<unknown> | React.ChangeEvent<HTMLInputElement>,
    id: number,
  ) => void;
  handleSelectAllClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    idsOnPage: number[],
  ) => void;
  handleDeselectAll: () => void;

  anchorEl: HTMLElement | null;
  currentPostForMenu: PostListItemDto | null;
  handleMenuOpen: (
    event: React.MouseEvent<HTMLElement>,
    item: PostListItemDto,
  ) => void;
  handleMenuClose: () => void;

  confirmDialogState: ConfirmationDialogState;
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => void;
  closeConfirmation: () => void;

  editingPostId: number | null;
  openEditModal: (id: number) => void;
  closeEditModal: () => void;

  snackbar: SnackbarState;
  showSnackbar: (message: string, severity?: AlertColor) => void;
  closeSnackbar: (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => void;
}

const PostsUIContext = createContext<PostsUIContextType | undefined>(undefined);

export const PostsUIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentPostForMenu, setCurrentPostForMenu] =
    useState<PostListItemDto | null>(null);
  const [confirmDialogState, setConfirmDialogState] =
    useState<ConfirmationDialogState>({ open: false, title: '', message: '' });
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleDeselectAll = useCallback(() => setSelected([]), []);

  const handleSelectRow = useCallback(
    (
      _event: React.MouseEvent<unknown> | React.ChangeEvent<HTMLInputElement>,
      id: number,
    ) => {
      setSelected((prevSelected) => {
        const selectedIndex = prevSelected.indexOf(id);
        let newSelected: readonly number[] = [];

        if (selectedIndex === -1) {
          newSelected = newSelected.concat(prevSelected, id);
        } else {
          newSelected = prevSelected.filter((selId) => selId !== id);
        }
        return newSelected;
      });
    },
    [],
  );

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, idsOnPage: number[]) => {
      if (event.target.checked) {
        const newSelecteds = Array.from(new Set([...selected, ...idsOnPage]));
        setSelected(newSelecteds);
        return;
      }
      setSelected((prevSelected) =>
        prevSelected.filter((selId) => !idsOnPage.includes(selId)),
      );
    },
    [selected],
  );

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, item: PostListItemDto) => {
      setAnchorEl(event.currentTarget);
      setCurrentPostForMenu(item);
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setCurrentPostForMenu(null);
  }, []);

  const showConfirmation = useCallback(
    (title: string, message: string, onConfirmAction: () => void) => {
      setConfirmDialogState({ open: true, title, message, onConfirmAction });
    },
    [],
  );

  const closeConfirmation = useCallback(() => {
    setConfirmDialogState((s) => ({ ...s, open: false }));
  }, []);

  const openEditModal = useCallback(
    (id: number) => {
      handleMenuClose();
      setEditingPostId(id);
    },
    [handleMenuClose],
  );

  const closeEditModal = useCallback(() => setEditingPostId(null), []);

  const showSnackbar = useCallback(
    (message: string, severity: AlertColor = 'success') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const closeSnackbar = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') return;
      setSnackbar((s) => ({ ...s, open: false }));
    },
    [],
  );

  const value = {
    selected,
    handleSelectRow,
    handleSelectAllClick,
    handleDeselectAll,
    anchorEl,
    currentPostForMenu,
    handleMenuOpen,
    handleMenuClose,
    confirmDialogState,
    showConfirmation,
    closeConfirmation,
    editingPostId,
    openEditModal,
    closeEditModal,
    snackbar,
    showSnackbar,
    closeSnackbar,
  };

  return (
    <PostsUIContext.Provider value={value}>{children}</PostsUIContext.Provider>
  );
};

export const usePostsUI = (): PostsUIContextType => {
  const context = useContext(PostsUIContext);
  if (context === undefined) {
    throw new Error('usePostsUI must be used within a PostsUIProvider');
  }
  return context;
};
