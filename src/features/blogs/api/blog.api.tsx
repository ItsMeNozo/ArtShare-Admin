import api from '../../../api/baseApi';

export interface AdminBlogListItemUserDto {
  id: string;
  username: string;
  profilePictureUrl?: string | null;
}

export interface AdminBlogListItemDto {
  id: number;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  averageRating: number;
  isProtected: boolean;
  ratingCount: number;
  pictures: any[];
  embeddedVideos: any[];
  viewCount: number;
  user: AdminBlogListItemUserDto;
}

export interface GetAllPostsAdminParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminBlogsResponse {
  blogs: AdminBlogListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface AdminUpdatePostDto {
  title?: string;
  description?: string;
  isMature?: boolean;
  aiCreated?: boolean;
  thumbnailUrl?: string;
  categoryIds?: number[];
  thumbnailCropMeta?: string;
  isPublished?: boolean;
  isPrivate?: boolean;
}

export interface PostDetailsResponseDto {
  id: number;
  userId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  isPublished: boolean;
  isPrivate: boolean;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  createdAt: string;
  medias: {
    id: number;
    mediaType: string;
    description?: string;
    url: string;
    creatorId: string;
    downloads: number;
    createdAt: string;
  }[];
  user: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string;
  };
  categories: {
    id: number;
    name: string;
    type: string;
  }[];
}

export const fetchBlogsForAdmin = async (
  params: GetAllPostsAdminParams,
): Promise<AdminBlogsResponse> => {
  const queryParams: any = { ...params };
  if (queryParams.page === undefined) delete queryParams.page;
  if (queryParams.pageSize === undefined) delete queryParams.pageSize;

  const resp = await api.get<{
    data: AdminBlogListItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  }>('/reports/blogs', { params: queryParams });

  return {
    blogs: resp.data.data,
    total: resp.data.total,
    page: resp.data.page,
    limit: resp.data.limit,
    totalPages: resp.data.totalPages,
    hasNextPage: resp.data.hasNextPage,
  };
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

export const adminDeleteBlog = async (blogId: number): Promise<void> => {
  await api.delete(`/blogs/${blogId}`);
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
  blogIds: number[],
): Promise<{ count: number }> => {
  const { data } = await api.delete('/blogs/admin/bulk-delete', {
    data: { blogIds },
  });
  return data;
};

export default api;
