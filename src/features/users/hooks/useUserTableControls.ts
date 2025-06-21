import { useState, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import { UserSortableKeys } from "../types";
import { useUsersQuery } from "./useUserQueries";

export const useUserTableControls = () => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<UserSortableKeys>("createdAt");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleChangePage = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(0);
  };

  const handleSortRequest = useCallback(
    (property: UserSortableKeys) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
      setCurrentPage(0);
    },
    [order, orderBy],
  );

  const queryParams = {
    page: currentPage + 1,
    limit: rowsPerPage,
    sortBy: orderBy,
    sortOrder: order,
    search: debouncedSearchTerm || undefined,
  };

  const { data, isLoading, isError, error } = useUsersQuery(queryParams);

  return {
    users: data?.data || [],
    totalUsers: data?.total || 0,
    loading: isLoading,
    error: isError ? (error as Error).message : null,
    currentPage,
    rowsPerPage,
    searchTerm,
    order,
    orderBy,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    handleSortRequest,
  };
};
