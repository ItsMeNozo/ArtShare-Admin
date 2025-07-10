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
  exampleImages: string[];
  type: CategoryType;
  createdAt: Date;
  updatedAt: Date | null;
  postsCount?: number;
  blogsCount?: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string | null;
  exampleImages?: string[];
  type?: keyof typeof CategoryTypeValues;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
  exampleImages?: string[];
  type?: keyof typeof CategoryTypeValues;
}
