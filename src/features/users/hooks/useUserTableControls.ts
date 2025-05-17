import React, { useState, ChangeEvent } from "react";
import { Order, UserSortableKeys } from "../types";

export interface UserTableControls {
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  order: Order;
  orderBy: UserSortableKeys;
  selectedIds: string[];
  handleChangePage: (_event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleRequestSort: (
    _event: React.MouseEvent<unknown>,
    property: UserSortableKeys,
  ) => void;
  handleSelectAllClick: (
    event: ChangeEvent<HTMLInputElement>,
    processedUserIds: string[],
  ) => void;
  handleRowCheckboxClick: (
    event: ChangeEvent<HTMLInputElement>,
    userId: string,
  ) => void;
  resetSelection: () => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useUserTableControls = (
  defaultOrderBy: UserSortableKeys = "username",
): UserTableControls => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<UserSortableKeys>(defaultOrderBy);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: UserSortableKeys,
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (
    event: ChangeEvent<HTMLInputElement>,
    processedUserIds: string[],
  ) => {
    if (event.target.checked) {
      setSelectedIds((prev) => [...new Set([...prev, ...processedUserIds])]);
      return;
    }

    setSelectedIds((prev) =>
      prev.filter((id) => !processedUserIds.includes(id)),
    );
  };

  const handleRowCheckboxClick = (
    event: ChangeEvent<HTMLInputElement>,
    userId: string,
  ) => {
    if (event.target.checked) {
      setSelectedIds((prevSelected) => [...prevSelected, userId]);
    } else {
      setSelectedIds((prevSelected) =>
        prevSelected.filter((id) => id !== userId),
      );
    }
  };

  const resetSelection = () => {
    setSelectedIds([]);
  };

  return {
    page,
    rowsPerPage,
    searchTerm,
    order,
    orderBy,
    selectedIds,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
    handleRequestSort,
    handleSelectAllClick,
    handleRowCheckboxClick,
    resetSelection,
    setSelectedIds,
  };
};
