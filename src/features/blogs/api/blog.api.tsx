import api from "../../../api/baseApi";

export interface AdminPostListItemUserDto {
  id: string;
  username: string;
  profile_picture_url?: string | null;
}

export interface AdminBlogListItemDto {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  like_count: number;
  comment_count: number;
  share_count: number;
  average_rating: number;
  is_protected: boolean;
  rating_count: number;
  pictures: any[];
  embedded_videos: any[];
  view_count: number;
}

export interface GetAllPostsAdminParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
  }>("/reports/blogs", { params: queryParams });

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
  const { data } = await api.patch("/posts/admin/bulk-publish", {
    postIds,
    publish,
  });
  return data;
};

export const bulkDeleteAdminPosts = async (
  blogIds: number[],
): Promise<{ count: number }> => {
  const { data } = await api.delete("/blogs/admin/bulk-delete", {
    data: { blogIds },
  });
  return data;
};

export default api;
