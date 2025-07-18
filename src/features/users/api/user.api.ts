import axios, { AxiosError } from 'axios';
import api from '../../../api/baseApi';
import { User, UserFormData } from '../../../types/user';

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filter?: string;
}

export interface PaginatedUsersApiResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

const getApiErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error;

    if (axiosError.response?.data?.message) {
      return Array.isArray(axiosError.response.data.message)
        ? axiosError.response.data.message.join(', ')
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

  return error.message || 'An unknown error occurred';
};

export const fetchUsers = async (
  params?: FetchUsersParams,
): Promise<PaginatedUsersApiResponse> => {
  try {
    const response = await api.get<PaginatedUsersApiResponse>(
      '/admin/users/all',
      { params },
    );
    return response.data;
  } catch (error) {
    console.error('API fetchUsers error:', error);
    throw new Error(getApiErrorMessage(error));
  }
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  try {
    const response = await api.post<User>('/admin/users/create', userData);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const updateUser = async (
  userId: string,
  userData: UserFormData,
): Promise<User> => {
  try {
    const response = await api.patch<User>(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(
      `/admin/users/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const deleteMultipleUsers = async (
  userIds: string[],
): Promise<{ count: number }> => {
  try {
    const response = await api.delete<{ count: number }>(
      '/admin/users/multiple',
      {
        data: { userIds },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error as AxiosError | Error));
  }
};
