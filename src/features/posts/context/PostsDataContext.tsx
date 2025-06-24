import React, { createContext, useState, useContext } from 'react';
import { useDebounce } from '../../../common/hooks/useDebounce';
import { useGetAdminPosts } from '../hooks/usePostQueries';
import { Order } from '../../users/types';
import { PostListItemDto } from '../types/post-api.types';

interface PostsDataContextType {
  posts: PostListItemDto[];
  totalPosts: number;
  isLoading: boolean;
  error: string | null;
  tableControls: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: Order;
    searchTerm: string;
    categoryId: number | null;
    setSearchTerm: (term: string) => void;
    setCategoryId: (id: number | null) => void;
    handleChangePage: (event: unknown, newPage: number) => void;
    handleChangePageSize: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: string,
    ) => void;
  };
}

const PostsDataContext = createContext<PostsDataContextType | undefined>(
  undefined,
);

export const PostsDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<Order>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isPlaceholderData, error } = useGetAdminPosts({
    page: page + 1,
    pageSize: pageSize,
    sortBy: sortBy,
    sortOrder: sortOrder,
    searchTerm: debouncedSearchTerm,
    categoryId: categoryId,
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleSetCategoryId = (id: number | null) => {
    setCategoryId(id);
    setPage(0);
  };

  const value = {
    posts: data?.posts || [],
    totalPosts: data?.total || 0,
    isLoading: isLoading || isPlaceholderData,
    error: error ? error.message : null,
    tableControls: {
      page,
      pageSize,
      sortBy,
      sortOrder,
      searchTerm,
      setSearchTerm,
      categoryId,
      setCategoryId: handleSetCategoryId,
      handleChangePage,
      handleChangePageSize,
      handleRequestSort,
    },
  };

  return (
    <PostsDataContext.Provider value={value}>
      {children}
    </PostsDataContext.Provider>
  );
};

export const usePostsData = (): PostsDataContextType => {
  const context = useContext(PostsDataContext);
  if (!context) {
    throw new Error('usePostsData must be used within a PostsDataProvider');
  }
  return context;
};
