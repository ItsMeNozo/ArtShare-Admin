export interface PostListItemUserDto {
  id: string;
  username: string;
  profile_picture_url?: string | null;
}

export interface PostCategoryDto {
  id: number;
  name: string;
}

export interface PostListItemDto {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  thumbnail_url: string;
  is_private: boolean;
  like_count: number;
  share_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  user: PostListItemUserDto;
  categories: PostCategoryDto[];
}

export interface PostFilterParams {
  categoryId?: number | null;
  userId?: string | null;
  isPublished?: boolean | null;
  isPrivate?: boolean | null;
  aiCreated?: boolean | null;
}

export interface GetAllPostsAdminParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: PostFilterParams;
}

export interface PostsResponse {
  data: PostListItemDto[];
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
  thumbnail_url?: string | null;
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
