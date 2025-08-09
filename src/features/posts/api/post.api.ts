import api from '../../../api/baseApi';
import {
  GetAllPostsAdminParams,
  PostDetailsResponseDto,
  PostsResponse,
} from '../types/post-api.types';

export const fetchAdminPosts = async (
  params: GetAllPostsAdminParams,
): Promise<PostsResponse> => {
  const queryParams: Record<string, any> = {};

  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.search) queryParams.search = params.search;
  if (params.sortBy) queryParams.sortBy = params.sortBy;
  if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

  if (params.filter) {
    const activeFilters = Object.fromEntries(
      Object.entries(params.filter).filter(
        ([_key, value]) => value !== null && value !== undefined,
      ),
    );

    if (Object.keys(activeFilters).length > 0) {
      queryParams.filter = JSON.stringify(activeFilters);
    }
  }

  const { data } = await api.get('/posts/admin/all', {
    params: queryParams,
  });

  return data;
};

export const fetchAdminPostDetails = async (
  postId: number,
): Promise<PostDetailsResponseDto> => {
  const { data } = await api.get(`/posts/${postId}`);
  return data;
};

export const adminUpdatePost = async (
  postId: number,
  updateData: FormData,
): Promise<PostDetailsResponseDto> => {
  const { data } = await api.patch(`/posts/admin/${postId}`, updateData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const adminUpdatePostPartial = async (
  postId: number,
  updateData: Record<string, any>,
): Promise<PostDetailsResponseDto> => {
  const { data } = await api.patch(`/posts/admin/${postId}`, updateData);
  return data;
};

export const adminDeletePost = async (postId: number): Promise<void> => {
  await api.delete(`/posts/admin/${postId}`);
};

export const bulkDeleteAdminPosts = async (
  postIds: number[],
): Promise<{ count: number }> => {
  const { data } = await api.delete('/posts/admin/bulk-delete', {
    data: { postIds },
  });
  return data;
};

export default api;
