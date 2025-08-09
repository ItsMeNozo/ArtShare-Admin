import { useCallback, useMemo, useRef } from 'react';
import { useDebounce } from '../../../common/hooks/useDebounce';

interface UseOptimizedSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  minSearchLength?: number;
  debounceDelay?: number;
}

export const useOptimizedSearch = ({
  searchTerm,
  setSearchTerm,
  minSearchLength = 2,
  debounceDelay = 500,
}: UseOptimizedSearchProps) => {
  const lastSearchRef = useRef<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  const handleSearchChange = useCallback(
    (newSearchTerm: string) => {
      setSearchTerm(newSearchTerm);
    },
    [setSearchTerm],
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    lastSearchRef.current = '';
  }, [setSearchTerm]);

  const isSearchActive = useMemo(() => {
    return debouncedSearchTerm.length >= minSearchLength;
  }, [debouncedSearchTerm, minSearchLength]);

  const hasSearchChanged = useMemo(() => {
    const changed = lastSearchRef.current !== debouncedSearchTerm;
    if (changed) {
      lastSearchRef.current = debouncedSearchTerm;
    }
    return changed;
  }, [debouncedSearchTerm]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearchActive,
    hasSearchChanged,
    handleSearchChange,
    clearSearch,
  };
};
