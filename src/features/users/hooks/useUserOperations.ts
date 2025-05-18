import { useState, useCallback } from "react";
import { User, UserFormData } from "../../../types/user";
import {
  fetchUsers as apiFetchUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiSingleDeleteUser,
  deleteMultipleUsers as apiBulkDeleteUsers,
} from "../api/user.api";

const getApiErrorMessage = (error: any): string => {
  if (error?.isAxiosError) {
    const axiosError = error as import("axios").AxiosError<any>;
    if (axiosError.response?.data?.message) {
      return Array.isArray(axiosError.response.data.message)
        ? axiosError.response.data.message.join(", ")
        : axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return (
      axiosError.message ||
      `Request failed with status ${axiosError.response?.status}`
    );
  }
  return error.message || "An unknown error occurred";
};

export interface UserOperations {
  users: User[];
  loading: boolean;
  error: string | null;
  loadUsers: () => Promise<void>;
  createUser: (formData: UserFormData) => Promise<User | undefined>;
  updateUser: (
    userId: string,
    formData: Omit<UserFormData, "id" | "password">,
  ) => Promise<User | undefined>;
  deleteUser: (userId: string) => Promise<boolean>;
  bulkDeleteUsers: (
    userIds: string[],
  ) => Promise<{ successCount: number; failCount: number }>;
  clearError: () => void;
  setErrorManually: (message: string | null) => void;
}

export const useUserOperations = (): UserOperations => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  const setErrorManually = (message: string | null) => setError(message);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchUsers();
      setUsers(data);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message || "Failed to fetch users.");
      console.error("loadUsers error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (
    formData: UserFormData,
  ): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await apiCreateUser(formData);

      await loadUsers();
      return newUser;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message || "Failed to create user.");
      console.error("createUser error:", err);

      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (
    userId: string,
    formData: Omit<UserFormData, "id" | "password">,
  ): Promise<User | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await apiUpdateUser(userId, formData);

      await loadUsers();
      return updatedUser;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message || "Failed to update user.");
      console.error("updateUser error:", err);
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
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message || "Failed to delete user. An error occurred.");
      console.error("deleteUser error:", err);

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
          `Successfully deleted ${successCount} user(s). Failed to delete ${failCount} user(s) (they may have already been deleted or an error occurred).`,
        );
      } else {
        setError(null);
      }
      return { successCount, failCount };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message || `Failed to delete some or all users.`);
      console.error("bulkDeleteUsers error:", err);
      await loadUsers();
      return { successCount: 0, failCount: userIds.length };
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    clearError,
    setErrorManually,
  };
};
