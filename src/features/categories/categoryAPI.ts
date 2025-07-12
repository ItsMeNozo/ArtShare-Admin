import api from '../../api/baseApi';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../types/category';
import { PaginatedResponse } from '../../types/paginated-response';
import { PaginationQuery } from '../../types/pagination-query';

const CATEGORIES_ENDPOINT = '/categories';

export const fetchCategories = async (
  query: Partial<PaginationQuery>,
): Promise<PaginatedResponse<Category>> => {
  try {
    const response = await api.get<PaginatedResponse<Category>>(
      CATEGORIES_ENDPOINT,
      {
        params: query,
      },
    );

    response.data.data = response.data.data.map((cat) => ({
      ...cat,
      createdAt: new Date(cat.createdAt),
      updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : null,
    }));
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await api.get<Category>(`${CATEGORIES_ENDPOINT}/${id}`);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: response.data.updatedAt
        ? new Date(response.data.updatedAt)
        : null,
    };
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    throw error;
  }
};

export const addCategory = async (
  categoryData: CreateCategoryDto,
): Promise<Category> => {
  try {
    const timeout =
      categoryData.exampleImages && categoryData.exampleImages.length > 0
        ? 60000
        : 10000;

    const response = await api.post<Category>(
      CATEGORIES_ENDPOINT,
      categoryData,
      { timeout },
    );
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: response.data.updatedAt
        ? new Date(response.data.updatedAt)
        : null,
    };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  categoryData: UpdateCategoryDto,
): Promise<Category> => {
  try {
    const timeout =
      categoryData.exampleImages && categoryData.exampleImages.length > 0
        ? 60000
        : 10000;

    const response = await api.patch<Category>(
      `${CATEGORIES_ENDPOINT}/${id}`,
      categoryData,
      { timeout },
    );
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: response.data.updatedAt
        ? new Date(response.data.updatedAt)
        : null,
    };
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<{ id: number }> => {
  try {
    await api.delete(`${CATEGORIES_ENDPOINT}/${id}`);
    return { id };
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    throw error;
  }
};
