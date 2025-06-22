import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  TableSortLabel,
  CircularProgress,
  Typography,
} from "@mui/material";

import { AdminPostListItemDto } from "../api/post.api";
import { CustomHeadCell, SortableFields } from "../types/adminPosts.types";
import AdminPostTableRow from "./AdminPostTableRow";

const headCells: ReadonlyArray<CustomHeadCell> = [
  {
    id: "select",
    label: "",
    numeric: false,
    sortable: false,
    minWidth: 40,
    maxWidth: 50,
    align: "center",
    disablePadding: true,
  },
  {
    id: "id",
    label: "ID",
    numeric: false,
    sortable: false,
    minWidth: 60,
    maxWidth: 80,
    align: "center",
  },
  {
    id: "title",
    label: "Title",
    numeric: false,
    sortable: true,
    minWidth: 250,
    cellMaxWidth: "400px",
    truncate: true,
  },
  {
    id: "user",
    label: "Author",
    numeric: false,
    sortable: true,
    minWidth: 180,
    cellMaxWidth: "250px",
    truncate: true,
  },
  {
    id: "created_at",
    label: "Created At",
    numeric: false,
    sortable: true,
    minWidth: 160,
  },
  {
    id: "actions",
    label: "Actions",
    numeric: false,
    sortable: false,
    minWidth: 80,
    maxWidth: 100,
    align: "center",
  },
];

interface AdminPostsTableProps {
  posts: AdminPostListItemDto[];
  loading: boolean;
  fetchError: string | null;
  totalPosts: number;
  page: number;
  rowsPerPage: number;
  orderBy: SortableFields;
  order: "asc" | "desc";
  numSelected: number;
  postIdsOnPage: number[];
  debouncedSearchTerm: string;

  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestSort: (property: SortableFields) => void;
  onSelectAllClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    postIds: number[],
  ) => void;
  onSelectRow: (id: number) => void;
  isSelected: (id: number) => boolean;
  onMenuOpen: (
    event: React.MouseEvent<HTMLButtonElement>,
    post: AdminPostListItemDto,
  ) => void;
  menuOpen: boolean;
  currentMenuPostId?: number;
}

const AdminPostsTable: React.FC<AdminPostsTableProps> = ({
  posts,
  loading,
  fetchError,
  totalPosts,
  page,
  rowsPerPage,
  orderBy,
  order,
  numSelected,
  postIdsOnPage,
  debouncedSearchTerm,
  onPageChange,
  onRowsPerPageChange,
  onRequestSort,
  onSelectAllClick,
  onSelectRow,
  isSelected,
  onMenuOpen,
  menuOpen,
  currentMenuPostId,
}) => {
  const cellConfigs = useMemo(
    () => ({
      selectCellConfig: headCells.find((hc) => hc.id === "select")!,
      idCellConfig: headCells.find((hc) => hc.id === "id")!,
      titleCellConfig: headCells.find((hc) => hc.id === "title")!,
      userCellConfig: headCells.find((hc) => hc.id === "user")!,
      createdAtCellConfig: headCells.find((hc) => hc.id === "created_at")!,
      actionsCellConfig: headCells.find((hc) => hc.id === "actions")!,
    }),
    [],
  );

  return (
    <>
      <TableContainer>
        <Table stickyHeader aria-label="admin posts table" size="small">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={
                    headCell.align || (headCell.numeric ? "right" : "left")
                  }
                  padding={headCell.disablePadding ? "none" : "normal"}
                  style={{
                    minWidth: headCell.minWidth,
                    maxWidth: headCell.maxWidth || headCell.cellMaxWidth,
                    fontWeight: "bold",
                  }}
                  sortDirection={
                    orderBy === headCell.id && headCell.sortable ? order : false
                  }
                >
                  {headCell.id === "select" ? (
                    <Checkbox
                      color="primary"
                      indeterminate={
                        numSelected > 0 && numSelected < posts.length
                      }
                      checked={
                        posts.length > 0 &&
                        numSelected === posts.length &&
                        numSelected > 0
                      }
                      onChange={(e) => onSelectAllClick(e, postIdsOnPage)}
                      inputProps={{ "aria-label": "select all posts" }}
                      disabled={posts.length === 0}
                    />
                  ) : headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() =>
                        onRequestSort(headCell.id as SortableFields)
                      }
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <CircularProgress sx={{ mb: 1 }} />
                  <Typography>Loading posts...</Typography>
                </TableCell>
              </TableRow>
            ) : posts.length === 0 && !fetchError ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <Typography>
                    {debouncedSearchTerm
                      ? "No posts found matching your search."
                      : "No posts available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <AdminPostTableRow
                  key={post.id}
                  post={post}
                  isSelected={isSelected(post.id)}
                  headCellConfigs={cellConfigs}
                  onSelectRow={onSelectRow}
                  onMenuOpen={onMenuOpen}
                  isMenuCurrentlyOpenForThisRow={
                    menuOpen && currentMenuPostId === post.id
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={totalPosts}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
};

export default AdminPostsTable;
