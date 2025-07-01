import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { Category, CategoryType } from "../../../types/category";
import { fetchCategories, deleteCategory } from "../categoryAPI";

interface CategoryDataContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  typeFilter: CategoryType | "ALL";
  filteredCategories: Category[];

  // Data operations
  refreshCategories: () => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  deleteBulkCategories: (ids: number[]) => Promise<void>;

  // Filter handlers
  setSearchTerm: (term: string) => void;
  setTypeFilter: (type: CategoryType | "ALL") => void;
}

const CategoryDataContext = createContext<CategoryDataContextType | undefined>(
  undefined,
);

export const CategoryDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<CategoryType | "ALL">("ALL");

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchesSearch = category.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType =
          typeFilter === "ALL" || category.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [categories, searchTerm, typeFilter],
  );

  const refreshCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories.");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      await refreshCategories();
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete category.");
    }
  };

  const deleteBulkCategories = async (ids: number[]) => {
    try {
      await Promise.all(ids.map((id) => deleteCategory(id)));
      await refreshCategories();
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete categories.");
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const value = {
    categories,
    loading,
    error,
    searchTerm,
    typeFilter,
    filteredCategories,
    refreshCategories,
    deleteCategory: handleDeleteCategory,
    deleteBulkCategories,
    setSearchTerm,
    setTypeFilter,
  };

  return (
    <CategoryDataContext.Provider value={value}>
      {children}
    </CategoryDataContext.Provider>
  );
};

export const useCategoryData = (): CategoryDataContextType => {
  const context = useContext(CategoryDataContext);
  if (context === undefined) {
    throw new Error(
      "useCategoryData must be used within a CategoryDataProvider",
    );
  }
  return context;
};
