import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  adminDeletePost,
  adminUpdatePost,
  bulkDeleteAdminPosts,
  fetchAdminPostDetails,
  fetchAdminPosts,
} from '../api/post.api';
import {
  GetAllPostsAdminParams,
  PostDetailsResponseDto,
  PostsResponse,
} from '../types/post-api.types';

export const postKeys = {
  all: ['adminPosts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params: GetAllPostsAdminParams) =>
    [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
};

export const useGetAdminPosts = (
  params: GetAllPostsAdminParams,
): UseQueryResult<PostsResponse, Error> => {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => fetchAdminPosts(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetAdminPostById = (
  postId: number,
): UseQueryResult<PostDetailsResponseDto, Error> => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchAdminPostDetails(postId),
    enabled: !!postId,
  });
};

export const useUpdateAdminPost = (): UseMutationResult<
  PostDetailsResponseDto,
  Error,
  { id: number; data: FormData },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      adminUpdatePost(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
    },
  });
};

export const useDeleteAdminPost = (): UseMutationResult<
  void,
  Error,
  number,
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDeletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

export const useBulkDeleteAdminPosts = (): UseMutationResult<
  { count: number },
  Error,
  number[],
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => bulkDeleteAdminPosts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
