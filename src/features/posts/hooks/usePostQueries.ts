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
  adminUpdatePostPartial,
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
    staleTime: params.search ? 60000 : 30000, // Longer stale time for search results
    gcTime: 10 * 60 * 1000, // Keep search results in cache for 10 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches during search
    refetchOnMount: false, // Use cached data when available
  });
};

export const useGetAdminPostById = (
  postId: number,
): UseQueryResult<PostDetailsResponseDto, Error> => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => fetchAdminPostDetails(postId),
    enabled: !!postId,
    staleTime: 0, // Always consider data stale for edit modal to get fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

export const useUpdateAdminPost = (): UseMutationResult<
  PostDetailsResponseDto,
  Error,
  { id: number; data: FormData | Record<string, any> },
  unknown
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: FormData | Record<string, any>;
    }) => {
      // Use appropriate API based on data type
      if (data instanceof FormData) {
        return adminUpdatePost(id, data);
      } else {
        return adminUpdatePostPartial(id, data);
      }
    },
    onSuccess: (updatedPost, { id }) => {
      // Update the specific post detail cache with fresh data
      queryClient.setQueryData(postKeys.detail(id), updatedPost);

      // Invalidate and refetch the lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });

      // Also invalidate the specific detail query to ensure next fetch is fresh
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
