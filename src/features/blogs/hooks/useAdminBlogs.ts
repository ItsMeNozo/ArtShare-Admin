import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  AdminBlogListItemDto,
  AdminBlogsResponse,
  GetAllPostsAdminParams,
  fetchBlogsForAdmin,
} from '../api/blog.api';

type Order = 'asc' | 'desc';
export type SortableFields = 'title' | 'author' | 'createdAt';

interface UseAdminBlogsProps {
  initialPage?: number;
  initialRowsPerPage?: number;
  initialOrderBy?: SortableFields;
  initialOrder?: Order;
}

export interface UseAdminBlogsReturn {
  blogs: AdminBlogListItemDto[];
  totalBlogs: number;
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
  refreshPosts: () => void;
}

export function useAdminBlogs({
  initialPage = 0,
  initialRowsPerPage = 10,
  initialOrderBy = 'createdAt',
  initialOrder = 'desc',
}: UseAdminBlogsProps = {}): UseAdminBlogsReturn {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [orderBy, setOrderBy] = useState<SortableFields>(initialOrderBy);
  const [order, setOrder] = useState<Order>(initialOrder);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<AdminBlogsResponse, Error>({
    queryKey: ['adminBlogs', page, rowsPerPage],
    queryFn: () =>
      fetchBlogsForAdmin({
        page: page + 1,
        pageSize: rowsPerPage,
      } as GetAllPostsAdminParams),
  });

  const raw = data?.blogs ?? [];
  const totalBlogs = data?.total ?? 0;

  // client-side filter + sort
  const blogs = useMemo(() => {
    let filtered = raw;
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.content?.toLowerCase() ?? '').includes(q),
      );
    }

    return [...filtered].sort((a, b) => {
      let aVal: string | number | undefined;
      let bVal: string | number | undefined;

      switch (orderBy) {
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'createdAt':
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        default:
          aVal = '';
          bVal = '';
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal === bVal) return 0;
      const comp = aVal > bVal ? 1 : -1;
      return order === 'asc' ? comp : -comp;
    });
  }, [raw, debouncedSearchTerm, orderBy, order]);

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
    blogs,
    totalBlogs,
    page,
    rowsPerPage,
    orderBy,
    order,
    loading: isLoading,
    error: queryError?.message ?? null,
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    handleChangePage,
    handleChangeRowsPerPage,
    handleRequestSort,
    refreshPosts: refetch,
  };
}
