import React, { createContext, useState, useContext, useEffect } from "react";
import { useDebounce } from "../../../common/hooks/useDebounce";
import { useGetAdminPosts } from "../hooks/usePostQueries";
import { Order } from "../../users/types";
import {
  GetAllPostsAdminParams,
  PostListItemDto,
} from "../types/post-api.types";
import { useSearchParams } from "react-router-dom";
interface PostsDataContextType {
  posts: PostListItemDto[];
  totalPosts: number;
  isLoading: boolean;
  error: string | null;
  tableControls: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: Order;
    searchTerm: string;
    categoryId: number | null;
    aiCreated: boolean | null;
    setSearchTerm: (term: string) => void;
    setCategoryId: (id: number | null) => void;
    setAiCreated: (value: boolean | null) => void;
    handleChangePage: (event: unknown, newPage: number) => void;
    handleChangePageSize: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: string,
    ) => void;
  };
}

const PostsDataContext = createContext<PostsDataContextType | undefined>(
  undefined,
);

export const PostsDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<Order>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [aiCreated, setAiCreated] = useState<boolean | null>(null);

  const [params] = useSearchParams();

  useEffect(() => {
    const aiCreatedParam = params.get("ai_created");

    if (aiCreatedParam === "true") {
      setAiCreated(true);
      setPage(0);
    } else if (aiCreatedParam === "false") {
      setAiCreated(false);
      setPage(0);
    } else {
      setAiCreated(null);
    }
  }, [params]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const queryParams: GetAllPostsAdminParams = {
    page: page + 1,
    limit: pageSize,
    sortBy: sortBy,
    sortOrder: sortOrder,
    search: debouncedSearchTerm,
    filter: {
      categoryId: categoryId,
      aiCreated: aiCreated,
    },
  };

  const { data, isLoading, isPlaceholderData, error } =
    useGetAdminPosts(queryParams);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  const handleSetCategoryId = (id: number | null) => {
    setCategoryId(id);
    setPage(0);
  };

  const handleSetAiCreated = (value: boolean | null) => {
    setAiCreated(value);
    setPage(0);
  };

  const value = {
    posts: data?.data || [],
    totalPosts: data?.total || 0,
    isLoading: isLoading || isPlaceholderData,
    error: error ? error.message : null,
    tableControls: {
      page,
      pageSize,
      sortBy,
      sortOrder,
      searchTerm,
      setSearchTerm,
      categoryId,
      setCategoryId: handleSetCategoryId,
      aiCreated,
      setAiCreated: handleSetAiCreated,
      handleChangePage,
      handleChangePageSize,
      handleRequestSort,
    },
  };

  return (
    <PostsDataContext.Provider value={value}>
      {children}
    </PostsDataContext.Provider>
  );
};

export const usePostsData = (): PostsDataContextType => {
  const context = useContext(PostsDataContext);
  if (!context) {
    throw new Error("usePostsData must be used within a PostsDataProvider");
  }
  return context;
};
