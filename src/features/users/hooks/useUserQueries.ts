import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchUsers as apiFetchUsers,
  FetchUsersParams,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiSingleDeleteUser,
  deleteMultipleUsers as apiBulkDeleteUsers,
} from "../api/user.api";
import { UserFormData } from "../../../types/user";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: FetchUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export const useUsersQuery = (params: FetchUsersParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => apiFetchUsers(params),
    placeholderData: keepPreviousData,
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: UserFormData) => apiCreateUser(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      formData,
    }: {
      userId: string;
      formData: UserFormData;
    }) => apiUpdateUser(userId, formData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(variables.userId),
      });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiSingleDeleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useBulkDeleteUsersMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => apiBulkDeleteUsers(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
