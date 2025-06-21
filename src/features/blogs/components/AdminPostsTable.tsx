import React, { useMemo } from 'react';
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
  Paper,
} from '@mui/material';

import AdminPostTableRow from './AdminPostTableRow';
import { AdminBlogListItemDto } from '../api/blog.api';
import {
  CustomHeadCell,
  SortableFields,
} from '../../posts/types/adminPosts.types';

const headCells: ReadonlyArray<CustomHeadCell> = [
  {
    id: 'select',
    label: '',
    numeric: false,
    sortable: false,
    minWidth: 40,
    maxWidth: 50,
    align: 'center',
    disablePadding: true,
  },
  {
    id: 'id',
    label: 'ID',
    numeric: false,
    sortable: false,
    minWidth: 60,
    maxWidth: 80,
    align: 'center',
  },
  {
    id: 'title',
    label: 'Title',
    numeric: false,
    sortable: true,
    minWidth: 250,
    cellMaxWidth: '400px',
    truncate: true,
  },
  {
    id: 'user',
    label: 'Author',
    numeric: false,
    sortable: true,
    minWidth: 180,
    cellMaxWidth: '250px',
    truncate: true,
  },
  {
    id: 'created_at',
    label: 'Created At',
    numeric: false,
    sortable: true,
    minWidth: 160,
  },
  {
    id: 'actions',
    label: 'Actions',
    numeric: false,
    sortable: false,
    minWidth: 80,
    maxWidth: 100,
    align: 'center',
  },
];

interface AdminPostsTableProps {
  blogs: AdminBlogListItemDto[];
  loading: boolean;
  fetchError: string | null;
  totalBlogs: number;
  page: number;
  rowsPerPage: number;
  orderBy: SortableFields;
  order: 'asc' | 'desc';
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
    blog: AdminBlogListItemDto,
  ) => void;
  menuOpen: boolean;
  currentMenuPostId?: number;
}

const AdminBlogsTable: React.FC<AdminPostsTableProps> = ({
  blogs,
  loading,
  fetchError,
  totalBlogs,
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
      selectCellConfig: headCells.find((hc) => hc.id === 'select')!,
      idCellConfig: headCells.find((hc) => hc.id === 'id')!,
      titleCellConfig: headCells.find((hc) => hc.id === 'title')!,
      userCellConfig: headCells.find((hc) => hc.id === 'user')!,
      createdAtCellConfig: headCells.find((hc) => hc.id === 'created_at')!,
      actionsCellConfig: headCells.find((hc) => hc.id === 'actions')!,
    }),
    [],
  );

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table stickyHeader aria-label="admin posts table" size="small">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={
                    headCell.align || (headCell.numeric ? 'right' : 'left')
                  }
                  padding={headCell.disablePadding ? 'none' : 'normal'}
                  style={{
                    minWidth: headCell.minWidth,
                    maxWidth: headCell.maxWidth || headCell.cellMaxWidth,
                    fontWeight: 'bold',
                  }}
                  sortDirection={
                    orderBy === headCell.id && headCell.sortable ? order : false
                  }
                >
                  {headCell.id === 'select' ? (
                    <Checkbox
                      color="primary"
                      indeterminate={
                        numSelected > 0 && numSelected < blogs.length
                      }
                      checked={
                        blogs.length > 0 &&
                        numSelected === blogs.length &&
                        numSelected > 0
                      }
                      onChange={(e) => onSelectAllClick(e, postIdsOnPage)}
                      inputProps={{ 'aria-label': 'select all blogs' }}
                      disabled={blogs.length === 0}
                    />
                  ) : headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
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
            ) : blogs.length === 0 && !fetchError ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <Typography>
                    {debouncedSearchTerm
                      ? 'No posts found matching your search.'
                      : 'No blogs available.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <AdminPostTableRow
                  key={blog.id}
                  blog={blog}
                  isSelected={isSelected(blog.id)}
                  headCellConfigs={cellConfigs}
                  onSelectRow={onSelectRow}
                  onMenuOpen={onMenuOpen}
                  isMenuCurrentlyOpenForThisRow={
                    menuOpen && currentMenuPostId === blog.id
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
        count={totalBlogs}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
};

export default AdminBlogsTable;
