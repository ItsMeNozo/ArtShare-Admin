import { useState, useCallback } from "react";

interface ConfirmationDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirmAction: (() => void) | null;
}

export interface UseConfirmationDialogReturn {
  dialogState: ConfirmationDialogState;
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => void;
  closeConfirmation: () => void;
}

export function useConfirmationDialog(): UseConfirmationDialogReturn {
  const [dialogState, setDialogState] = useState<ConfirmationDialogState>({
    open: false,
    title: "",
    message: "",
    onConfirmAction: null,
  });

  const showConfirmation = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setDialogState({
        open: true,
        title,
        message,
        onConfirmAction: onConfirm,
      });
    },
    [],
  );

  const closeConfirmation = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false, onConfirmAction: null }));
  }, []);

  return {
    dialogState,
    showConfirmation,
    closeConfirmation,
  };
}
