import { useState, useCallback } from "react";

export interface UseTableSelectionReturn {
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  handleSelectAllClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    itemIdsOnPage: number[],
  ) => void;
  handleClick: (id: number) => void;
  isSelected: (id: number) => boolean;
  handleDeselectAll: () => void;
  numSelected: number;
}

export function useTableSelection(
  initialSelected: number[] = [],
): UseTableSelectionReturn {
  const [selected, setSelected] = useState<number[]>(initialSelected);

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, itemIdsOnPage: number[]) => {
      if (event.target.checked) {
        setSelected(itemIdsOnPage);
      } else {
        setSelected([]);
      }
    },
    [],
  );

  const handleClick = useCallback((id: number) => {
    setSelected((prevSelected) => {
      const isCurrentlySelected = prevSelected.includes(id);
      if (isCurrentlySelected) {
        return prevSelected.filter((itemId) => itemId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  const isSelected = useCallback(
    (id: number) => selected.includes(id),
    [selected],
  );

  const handleDeselectAll = useCallback(() => {
    setSelected([]);
  }, []);

  return {
    selected,
    setSelected,
    handleSelectAllClick,
    handleClick,
    isSelected,
    handleDeselectAll,
    numSelected: selected.length,
  };
}
