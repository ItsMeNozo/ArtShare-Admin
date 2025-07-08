import { useState, useCallback } from 'react';

export interface UseEditModalReturn<TId> {
  isModalOpen: boolean;
  editingItemId: TId | null;
  openModal: (id: TId) => void;
  closeModal: () => void;
}

export function useEditModal<TId>(): UseEditModalReturn<TId> {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<TId | null>(null);

  const openModal = useCallback((id: TId) => {
    setEditingItemId(id);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItemId(null);
  }, []);

  return {
    isModalOpen,
    editingItemId,
    openModal,
    closeModal,
  };
}
