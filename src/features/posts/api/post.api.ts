import api from '../../../api/baseApi';

export interface AdminPostListItemUserDto {
  id: string;
  username: string;
  profile_picture_url?: string | null;
}

export interface AdminPostListItemDto {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  is_published: boolean;
  is_private: boolean;
  like_count: number;
  share_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  user: AdminPostListItemUserDto;
}

export interface GetAllPostsAdminParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  userId?: string;
  isPublished?: boolean | null;
  isPrivate?: boolean | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminPostsResponse {
  posts: AdminPostListItemDto[];
  total: number;
}

export interface AdminUpdatePostDto {
  title?: string;
  description?: string;
  is_mature?: boolean;
  ai_created?: boolean;
  thumbnail_url?: string;

  cate_ids?: number[];

  thumbnail_crop_meta?: string;

  is_published?: boolean;
  is_private?: boolean;
}

export interface PostDetailsResponseDto {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  is_published: boolean;
  is_private: boolean;
  like_count: number;
  share_count: number;
  comment_count: number;
  created_at: string;
  medias: {
    id: number;
    media_type: string;
    description?: string;
    url: string;
    creator_id: string;
    downloads: number;
    created_at: string;
  }[];
  user: {
    id: string;
    username: string;
    full_name: string;
    profile_picture_url: string;
  };
  categories: {
    id: number;
    name: string;
    type: string;
  }[];
}

export const fetchAdminPosts = async (
  params: GetAllPostsAdminParams,
): Promise<AdminPostsResponse> => {
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

export const bulkPublishAdminPosts = async (
  postIds: number[],
  publish: boolean,
): Promise<{ count: number }> => {
  const { data } = await api.patch('/posts/admin/bulk-publish', {
    postIds,
    publish,
  });
  return data;
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
