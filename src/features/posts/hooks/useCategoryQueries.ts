import { useQuery } from '@tanstack/react-query';
import { CategorySimple } from '../../../types/category';
import { fetchSimpleCategories } from '../../categories/categoryAPI';

export const useGetCategories = () => {
  return useQuery<CategorySimple[], Error>({
    queryKey: ['categories'],
    queryFn: fetchSimpleCategories,
    staleTime: 5 * 60 * 1000,
  });
};
