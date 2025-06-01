import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminPosts,
  AdminPostListItemDto,
  GetAllPostsAdminParams,
  AdminPostsResponse,
} from '../api/post.api';

type Order = 'asc' | 'desc';
type SortableFields = 'title' | 'user' | 'created_at';

interface UseAdminPostsProps {
  initialPage?: number;
  initialRowsPerPage?: number;
  initialOrderBy?: SortableFields;
  initialOrder?: Order;
}

export interface UseAdminPostsReturn {
  posts: AdminPostListItemDto[];
  totalPosts: number;
  page: number;
  rowsPerPage: number;
  orderBy: SortableFields;
  order: Order;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  debouncedSearchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleChangePage: (_: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRequestSort: (property: SortableFields) => void;
  refreshPosts: () => Promise<void>;
}

export function useAdminPosts({
  initialPage = 0,
  initialRowsPerPage = 10,
  initialOrderBy = 'created_at',
  initialOrder = 'desc',
}: UseAdminPostsProps = {}): UseAdminPostsReturn {
  const [posts, setPosts] = useState<AdminPostListItemDto[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [orderBy, setOrderBy] = useState<SortableFields>(initialOrderBy);
  const [order, setOrder] = useState<Order>(initialOrder);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setPage(0);
      }
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm, debouncedSearchTerm]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params: GetAllPostsAdminParams = {
      page: page + 1,
      pageSize: rowsPerPage,
      searchTerm: debouncedSearchTerm || undefined,
      sortBy: orderBy,
      sortOrder: order,
    };
    try {
      const response: AdminPostsResponse = await fetchAdminPosts(params);
      setPosts(response.posts);
      setTotalPosts(response.total);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to fetch posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchTerm, orderBy, order]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: SortableFields) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  return {
    posts,
    totalPosts,
    page,
    rowsPerPage,
    orderBy,
    order,
    loading,
    error,
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    handleChangePage,
    handleChangeRowsPerPage,
    handleRequestSort,
    refreshPosts: fetchPosts,
  };
}
