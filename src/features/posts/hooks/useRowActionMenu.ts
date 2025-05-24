import { useState, useCallback } from 'react';

interface UseRowActionMenuReturn<T> {
  anchorEl: null | HTMLElement;
  currentMenuOpenItem: T | null;
  isMenuOpen: boolean;
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>, item: T) => void;
  handleMenuClose: () => void;
}

export function useRowActionMenu<T>(): UseRowActionMenuReturn<T> {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenuOpenItem, setCurrentMenuOpenItem] = useState<T | null>(
    null,
  );

  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, item: T) => {
      setAnchorEl(event.currentTarget);
      setCurrentMenuOpenItem(item);
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setCurrentMenuOpenItem(null);
  }, []);

  return {
    anchorEl,
    currentMenuOpenItem,
    isMenuOpen,
    handleMenuOpen,
    handleMenuClose,
  };
}
