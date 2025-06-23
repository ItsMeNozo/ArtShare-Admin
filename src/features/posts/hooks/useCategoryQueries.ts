import { useQuery } from "@tanstack/react-query";
import { Category } from "../../../types/category";
import { fetchCategories } from "../../categories/categoryAPI";

export const useGetCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });
};
