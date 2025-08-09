import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

interface UseSearchPerformanceProps {
  queryKey: readonly unknown[];
  minSearchLength?: number;
}

export const useSearchPerformance = ({
  queryKey,
  minSearchLength = 2,
}: UseSearchPerformanceProps) => {
  const queryClient = useQueryClient();
  const searchCacheRef = useRef(new Map<string, any>());
  const lastSearchRef = useRef<string>('');

  const optimizeSearchQuery = useCallback(
    (searchTerm: string) => {
      // Skip API call for very short searches
      if (searchTerm.length > 0 && searchTerm.length < minSearchLength) {
        return null;
      }

      // Use cached results for repeated searches
      if (searchCacheRef.current.has(searchTerm)) {
        return searchCacheRef.current.get(searchTerm);
      }

      return searchTerm;
    },
    [minSearchLength],
  );

  const prefetchSearchResults = useCallback(
    async (searchTerm: string, queryFn: () => Promise<any>) => {
      if (searchTerm.length >= minSearchLength) {
        try {
          const data = await queryClient.fetchQuery({
            queryKey: [...queryKey, { search: searchTerm }],
            queryFn,
            staleTime: 2 * 60 * 1000, // 2 minutes
          });

          // Cache the result
          searchCacheRef.current.set(searchTerm, data);
          return data;
        } catch (error) {
          console.warn('Search prefetch failed:', error);
        }
      }
    },
    [queryClient, queryKey, minSearchLength],
  );

  const clearSearchCache = useCallback(() => {
    searchCacheRef.current.clear();
    lastSearchRef.current = '';
  }, []);

  const invalidateSearchQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
    clearSearchCache();
  }, [queryClient, queryKey, clearSearchCache]);

  const isValidSearch = useCallback(
    (searchTerm: string) => {
      return searchTerm.length === 0 || searchTerm.length >= minSearchLength;
    },
    [minSearchLength],
  );

  return {
    optimizeSearchQuery,
    prefetchSearchResults,
    clearSearchCache,
    invalidateSearchQueries,
    isValidSearch,
  };
};
