import React, { createContext, useContext, useMemo } from 'react';
import { User } from '../../../types/user';
import {
  useBulkDeleteUsersMutation,
  useDeleteUserMutation,
} from '../hooks/useUserQueries';
import { useUserTableControls } from '../hooks/useUserTableControls';
import {
  getCurrentEffectivePlanNameForTable,
  getSubscriptionStatusInfo,
} from '../utils/userTable.utils';

interface UserDataContextType {
  displayUsers: (User & { currentPlan?: string })[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  deleteUserMutation: ReturnType<typeof useDeleteUserMutation>;
  bulkDeleteUsersMutation: ReturnType<typeof useBulkDeleteUsersMutation>;

  tableControls: Omit<
    ReturnType<typeof useUserTableControls>,
    'users' | 'loading' | 'error' | 'totalUsers'
  >;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { users, loading, error, totalUsers, ...tableControls } =
    useUserTableControls();

  const deleteUserMutation = useDeleteUserMutation();
  const bulkDeleteUsersMutation = useBulkDeleteUsersMutation();

  const displayUsers = useMemo(() => {
    return users.map((user) => ({
      ...user,
      currentPlan: getCurrentEffectivePlanNameForTable(
        user,
        getSubscriptionStatusInfo(user),
      ),
    }));
  }, [users]);

  const value = {
    displayUsers,
    loading,
    error,
    totalUsers,
    deleteUserMutation,
    bulkDeleteUsersMutation,
    tableControls,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
