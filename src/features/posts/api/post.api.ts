import api from '../../../api/baseApi';
import {
  GetAllPostsAdminParams,
  PostsResponse,
  PostDetailsResponseDto,
  AdminUpdatePostDto,
} from '../types/post-api.types';

export const fetchAdminPosts = async (
  params: GetAllPostsAdminParams,
): Promise<PostsResponse> => {
  const queryParams: any = { ...params };
  if (params.isPublished === true) queryParams.isPublished = 'true';
  else if (params.isPublished === false) queryParams.isPublished = 'false';
  else delete queryParams.isPublished;

  if (params.isPrivate === true) queryParams.isPrivate = 'true';
  else if (params.isPrivate === false) queryParams.isPrivate = 'false';
  else delete queryParams.isPrivate;

  if (queryParams.page === undefined) delete queryParams.page;
  if (queryParams.pageSize === undefined) delete queryParams.pageSize;

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
  updateData: AdminUpdatePostDto,
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
