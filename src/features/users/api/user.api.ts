import axios, { AxiosError } from "axios";
import { User, UserFormData } from "../../../types/user";
import api from "../../../api/baseApi";

const getApiErrorMessage = (error: AxiosError | any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

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

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>("/admin/users/all");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const createUser = async (userData: UserFormData): Promise<User> => {
  try {
    const response = await api.post<User>("/admin/users/create", userData);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const updateUser = async (
  userId: string,
  userData: Omit<UserFormData, "id" | "password">,
): Promise<User> => {
  const payload = {
    username: userData.username,
    email: userData.email,
    fullName: userData.fullName,
    profilePictureUrl: userData.profilePictureUrl,
    bio: userData.bio,
    birthday: userData.birthday,
    roles: userData.roles,
  };
  try {
    const response = await api.patch<User>(`/admin/users/${userId}`, payload);
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
      "/admin/users/multiple",
      {
        data: { userIds },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error as AxiosError | Error));
  }
};
