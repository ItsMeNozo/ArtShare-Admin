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
  sortOrder?: "asc" | "desc";
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
