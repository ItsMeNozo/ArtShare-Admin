import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Category, CategoryType } from '../../../types/category';
import { PaginationQuery } from '../../../types/pagination-query';
import { deleteCategory, fetchCategories } from '../categoryAPI';

interface CategoryDataContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  typeFilter: CategoryType | 'ALL';
  filteredCategories: Category[];
  page: number;
  pageSize: number;
  totalCount: number;

  // Data operations
  refreshCategories: () => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  deleteBulkCategories: (ids: number[]) => Promise<void>;

  // Filter and pagination handlers
  setSearchTerm: (term: string) => void;
  setTypeFilter: (type: CategoryType | 'ALL') => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

const CategoryDataContext = createContext<CategoryDataContextType | undefined>(
  undefined,
);

export const CategoryDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<CategoryType | 'ALL'>('ALL');
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const refreshCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: Partial<PaginationQuery> = {
        page: page + 1,
        limit: pageSize,
        search: searchTerm,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      };

      if (typeFilter !== 'ALL') {
        query.filter = JSON.stringify({ type: typeFilter });
      }

      const response = await fetchCategories(query);
      setCategories(response.data);
      setTotalCount(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, typeFilter]);

  useEffect(() => {
    console.log(
      `Fetching data for page: ${page}, size: ${pageSize}, search: "${searchTerm}"`,
    );
    refreshCategories();
  }, [refreshCategories]);

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      await refreshCategories();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete category.');
    }
  };

  const deleteBulkCategories = async (ids: number[]) => {
    try {
      await Promise.all(ids.map((id) => deleteCategory(id)));
      await refreshCategories();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete categories.');
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const value = {
    categories,
    loading,
    error,
    searchTerm,
    typeFilter,
    filteredCategories: categories,
    page,
    pageSize,
    totalCount,
    refreshCategories,
    deleteCategory: handleDeleteCategory,
    deleteBulkCategories,
    setSearchTerm,
    setTypeFilter,
    setPage,
    setPageSize,
  };

  return (
    <CategoryDataContext.Provider value={value}>
      {children}
    </CategoryDataContext.Provider>
  );
};

export const useCategoryData = (): CategoryDataContextType => {
  const context = useContext(CategoryDataContext);
  if (context === undefined) {
    throw new Error(
      'useCategoryData must be used within a CategoryDataProvider',
    );
  }
  return context;
};
