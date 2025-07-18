import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { UserFormData } from '../../../types/user';
import {
  deleteMultipleUsers as apiBulkDeleteUsers,
  createUser as apiCreateUser,
  fetchUsers as apiFetchUsers,
  deleteUser as apiSingleDeleteUser,
  updateUser as apiUpdateUser,
  FetchUsersParams,
} from '../api/user.api';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: FetchUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
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
