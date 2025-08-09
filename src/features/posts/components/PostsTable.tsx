import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Box,
  Checkbox,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useMemo } from 'react';
import { headCells } from '../constants/postsTable.constants';
import { usePostsData } from '../context/PostsDataContext';
import { usePostsUI } from '../context/PostsUIContext';
import { SortableFields } from '../types/table.types';
import AdminPostTableRow from './PostTableRow';

const PostsTable: React.FC = () => {
  const theme = useTheme();

  const { posts, totalPosts, isLoading, error, tableControls } = usePostsData();
  const { selected, handleSelectAllClick } = usePostsUI();

  const postIdsOnPage = useMemo(() => posts.map((p) => p.id), [posts]);
  const numSelectedOnPage = useMemo(
    () => selected.filter((id) => postIdsOnPage.includes(id)).length,
    [selected, postIdsOnPage],
  );
  const rowCountOnPage = posts.length;

  // Memoize rows to prevent unnecessary re-renders when selection changes
  const memoizedRows = useMemo(
    () => posts.map((post) => <AdminPostTableRow key={post.id} post={post} />),
    [posts],
  );

  return (
    <>
      <TableContainer>
        <Table>
          {/* ==================== Table Head ==================== */}
          <TableHead
            sx={{
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[100],
            }}
          >
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  padding={headCell.id === 'select' ? 'checkbox' : 'normal'}
                  style={{
                    minWidth: headCell.minWidth,
                    maxWidth: headCell.maxWidth || headCell.cellMaxWidth,
                    fontWeight: 'bold',
                  }}
                  sortDirection={
                    tableControls.sortBy === headCell.id
                      ? tableControls.sortOrder
                      : false
                  }
                >
                  {headCell.id === 'select' ? (
                    <Checkbox
                      color="primary"
                      indeterminate={
                        numSelectedOnPage > 0 &&
                        numSelectedOnPage < rowCountOnPage
                      }
                      checked={
                        rowCountOnPage > 0 &&
                        numSelectedOnPage === rowCountOnPage
                      }
                      onChange={(e) => handleSelectAllClick(e, postIdsOnPage)}
                      disabled={rowCountOnPage === 0}
                      inputProps={{
                        'aria-label': 'select all posts on this page',
                      }}
                    />
                  ) : headCell.sortable ? (
                    <TableSortLabel
                      active={tableControls.sortBy === headCell.id}
                      direction={
                        tableControls.sortBy === headCell.id
                          ? tableControls.sortOrder
                          : 'asc'
                      }
                      onClick={(e) =>
                        tableControls.handleRequestSort(
                          e,
                          headCell.id as SortableFields,
                        )
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length}
                  sx={{ border: 'none', py: 10 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length}
                  sx={{ border: 'none', py: 10, textAlign: 'center' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      color: 'error.main',
                    }}
                  >
                    <ErrorOutlineIcon sx={{ fontSize: 64 }} />
                    <Typography variant="h6">Failed to load posts</Typography>
                    <Typography variant="body2">{error}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length}
                  sx={{ border: 'none', py: 10, textAlign: 'center' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      color: 'text.secondary',
                    }}
                  >
                    <Typography variant="h6">No posts found</Typography>
                    <Typography variant="body2">
                      Try adjusting your search or filter criteria.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              memoizedRows
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={totalPosts}
        rowsPerPage={tableControls.pageSize}
        page={tableControls.page}
        onPageChange={tableControls.handleChangePage}
        onRowsPerPageChange={tableControls.handleChangePageSize}
      />
    </>
  );
};

const MemoizedPostsTable = React.memo(PostsTable);
MemoizedPostsTable.displayName = 'PostsTable';
export default MemoizedPostsTable;
