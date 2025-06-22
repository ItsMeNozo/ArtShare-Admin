import { useState, useCallback, useEffect } from 'react';
import { User, UserFormData } from '../../../types/user';
import { UserStatus } from '../../../constants/user';
import { UserRoleType } from '../../../constants/roles';
import {
  fetchUsers as apiFetchUsers,
  FetchUsersParams,
  PaginatedUsersApiResponse,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiSingleDeleteUser,
  deleteMultipleUsers as apiBulkDeleteUsers,
} from '../api/user.api';
import { useDebounce } from './useDebounce';
import { UserSortableKeys } from '../types';
import { getPrimaryRole } from '../utils/userTable.utils';

/**
 * Hook for managing user operations and filtering.
 *
 * Backend Filter Support:
 * - ✅ search: Full text search across user fields
 * - ✅ sortBy/sortOrder: Server-side sorting
 * - ✅ page/limit: Pagination
 * - ❌ status: Client-side only until backend supports it
 * - ❌ role: Client-side only until backend supports it
 *
 * Note: Status and role filters are applied client-side after fetching data.
 * This may impact pagination accuracy and performance with large datasets.
 */

export interface UserOperations {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  rowsPerPage: number;
  searchTerm: string;
  statusFilter: UserStatus | 'ALL';
  roleFilter: UserRoleType | 'ALL';
  order: 'asc' | 'desc';
  orderBy: UserSortableKeys;

  loadUsers: () => Promise<void>;
  createUser: (formData: UserFormData) => Promise<User | undefined>;
  updateUser: (
    userId: string,
    formData: Omit<UserFormData, 'id' | 'password'>,
  ) => Promise<User | undefined>;
  deleteUser: (userId: string) => Promise<boolean>;
  bulkDeleteUsers: (
    userIds: string[],
  ) => Promise<{ successCount: number; failCount: number }>;
  clearError: () => void;
  setErrorManually: (message: string | null) => void;

  handleChangePage: (newPage: number) => void;
  handleChangeRowsPerPage: (newRowsPerPage: number) => void;
  handleSearchChange: (newSearchTerm: string) => void;
  handleStatusFilterChange: (newStatusFilter: UserStatus | 'ALL') => void;
  handleRoleFilterChange: (newRoleFilter: UserRoleType | 'ALL') => void;
  handleSortRequest: (property: UserSortableKeys) => void;
}

export const useUserOperations = (): UserOperations => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<UserRoleType | 'ALL'>('ALL');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<UserSortableKeys>('createdAt');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const clearError = () => setError(null);
  const setErrorManually = (message: string | null) => setError(message);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: Backend doesn't support role filtering yet, so we only send supported parameters
      const params: FetchUsersParams = {
        page: currentPage + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order,
        search: debouncedSearchTerm || undefined,
        // status: statusFilter !== "ALL" ? statusFilter : undefined, // TODO: Uncomment when backend supports status filtering
        // role: roleFilter !== "ALL" ? roleFilter : undefined, // TODO: Uncomment when backend supports role filtering
      };

      const response: PaginatedUsersApiResponse = await apiFetchUsers(params);

      // Apply client-side filtering for status and role until backend supports them
      let filteredUsers = response.data;

      // Client-side status filtering
      if (statusFilter !== 'ALL') {
        filteredUsers = filteredUsers.filter(
          (user) => user.status === statusFilter,
        );
      }

      // Client-side role filtering
      if (roleFilter !== 'ALL') {
        filteredUsers = filteredUsers.filter((user) => {
          const primaryRole = getPrimaryRole(user.roles);
          return primaryRole === roleFilter;
        });
      }

      setUsers(filteredUsers);
      setTotalUsers(response.total); // Keep original total for now, will be fixed when backend supports role filtering
    } catch (err: any) {
      const message = err.message || 'Failed to fetch users.';
      setError(message);
      console.error('loadUsers error:', err);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    rowsPerPage,
    debouncedSearchTerm,
    statusFilter,
    roleFilter,
    order,
    orderBy,
  ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const createUser = async (
    formData: UserFormData,
  ): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await apiCreateUser(formData);
      await loadUsers();
      return newUser;
    } catch (err: any) {
      const message = err.message || 'Failed to create user.';
      setError(message);
      console.error('createUser error:', err);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    formData: Omit<UserFormData, 'id' | 'password'>,
  ): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await apiUpdateUser(userId, formData);
      await loadUsers();
      return updatedUser;
    } catch (err: any) {
      const message = err.message || 'Failed to update user.';
      setError(message);
      console.error('updateUser error:', err);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiSingleDeleteUser(userId);

      await loadUsers();
      return true;
    } catch (err: any) {
      const message = err.message || 'Failed to delete user.';
      setError(message);
      console.error('deleteUser error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteUsers = async (
    userIds: string[],
  ): Promise<{ successCount: number; failCount: number }> => {
    if (userIds.length === 0) return { successCount: 0, failCount: 0 };
    setLoading(true);
    setError(null);
    try {
      const result = await apiBulkDeleteUsers(userIds);

      await loadUsers();
      const successCount = result.count;
      const failCount = userIds.length - result.count;

      if (failCount > 0) {
        setError(
          `Successfully deleted ${successCount} user(s). Failed to delete ${failCount} user(s).`,
        );
      } else if (successCount > 0) {
        setError(null);
      }
      return { successCount, failCount };
    } catch (err: any) {
      const message = err.message || `Failed to delete some or all users.`;
      setError(message);
      console.error('bulkDeleteUsers error:', err);
      await loadUsers();
      return { successCount: 0, failCount: userIds.length };
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(0);
  };

  const handleStatusFilterChange = (newStatusFilter: UserStatus | 'ALL') => {
    setStatusFilter(newStatusFilter);
    setCurrentPage(0);
  };

  const handleRoleFilterChange = (newRoleFilter: UserRoleType | 'ALL') => {
    setRoleFilter(newRoleFilter);
    setCurrentPage(0);
  };

  const handleSortRequest = useCallback(
    (property: UserSortableKeys) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
      setCurrentPage(0);
    },
    [order, orderBy],
  );

  return {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    rowsPerPage,
    searchTerm,
    statusFilter,
    roleFilter,
    order,
    orderBy,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    clearError,
    setErrorManually,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    handleStatusFilterChange,
    handleRoleFilterChange,
    handleSortRequest,
  };
};
