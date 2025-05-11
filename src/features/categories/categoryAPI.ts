import api from "../../api/baseApi";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../types/category"; // Adjust the import path as necessary

const CATEGORIES_ENDPOINT = "/categories"; // Your NestJS categories endpoint

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>(CATEGORIES_ENDPOINT);
    // Convert date strings to Date objects if necessary
    return response.data.map((cat) => ({
      ...cat,
      created_at: new Date(cat.created_at),
      updated_at: cat.updated_at ? new Date(cat.updated_at) : null,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    // You might want to throw the error or return a specific error object
    throw error;
  }
};

export const fetchCategoryById = async (id: number): Promise<Category> => {
  try {
    const response = await api.get<Category>(`${CATEGORIES_ENDPOINT}/${id}`);
    return {
      ...response.data,
      created_at: new Date(response.data.created_at),
      updated_at: response.data.updated_at
        ? new Date(response.data.updated_at)
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
    const response = await api.post<Category>(
      CATEGORIES_ENDPOINT,
      categoryData,
    );
    return {
      ...response.data,
      created_at: new Date(response.data.created_at),
      updated_at: response.data.updated_at
        ? new Date(response.data.updated_at)
        : null,
    };
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  categoryData: UpdateCategoryDto,
): Promise<Category> => {
  try {
    const response = await api.patch<Category>(
      `${CATEGORIES_ENDPOINT}/${id}`,
      categoryData,
    ); // Assuming PATCH for updates
    return {
      ...response.data,
      created_at: new Date(response.data.created_at),
      updated_at: response.data.updated_at
        ? new Date(response.data.updated_at)
        : null,
    };
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<{ id: number }> => {
  // Or void, or the deleted category
  try {
    await api.delete(`${CATEGORIES_ENDPOINT}/${id}`);
    return { id }; // Indicate success
  } catch (error) {
    console.error(`Error deleting category with id ${id}:`, error);
    throw error;
  }
};
