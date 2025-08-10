import { useCallback, useRef } from 'react';

interface UseIsolatedSearchProps {
  onSearchChange: (term: string) => void;
  currentSearchTerm: string;
}

export const useIsolatedSearch = ({
  onSearchChange,
  currentSearchTerm,
}: UseIsolatedSearchProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastSearchRef = useRef<string>(currentSearchTerm);

  const handleSearchInput = useCallback(
    (value: string) => {
      // Only trigger change if search term actually changed
      if (lastSearchRef.current !== value) {
        lastSearchRef.current = value;
        onSearchChange(value);
      }
    },
    [onSearchChange],
  );

  const clearSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    handleSearchInput('');
  }, [handleSearchInput]);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  return {
    searchInputRef,
    handleSearchInput,
    clearSearch,
    focusSearch,
  };
};
