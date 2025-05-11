export const CategoryTypeValues = {
  MEDIUM: "MEDIUM",
  ATTRIBUTE: "ATTRIBUTE",
} as const;

export type CategoryType =
  (typeof CategoryTypeValues)[keyof typeof CategoryTypeValues];

export interface Category {
  id: number;
  name: string;
  description: string | null;
  example_images: string[];
  type: CategoryType;
  created_at: Date;
  updated_at: Date | null;
  posts_count?: number;
  blogs_count?: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
  example_images?: string[];
  type?: keyof typeof CategoryTypeValues;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
  example_images?: string[];
  type?: keyof typeof CategoryTypeValues;
}
