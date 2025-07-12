export interface PostListItemUserDto {
  id: string;
  username: string;
  profilePictureUrl?: string | null;
}

export interface PostCategoryDto {
  id: number;
  name: string;
}

export interface PostListItemDto {
  id: number;
  userId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  isPrivate: boolean;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
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
  isMature?: boolean;
  aiCreated?: boolean;
  thumbnailUrl?: string | null;
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
