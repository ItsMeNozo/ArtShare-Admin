import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import { Category, CategoryTypeValues } from '../../../types/category';
import { useCategoryData } from '../context/CategoryDataContext';
import { useCategoryInterface } from '../context/CategoryInterfaceContext';

const categoryTypeTooltips = {
  [CategoryTypeValues.ATTRIBUTE]:
    "Attribute: Describes characteristics or properties. Used for filtering or defining features (e.g., 'Color', 'Size', 'Style').",
  [CategoryTypeValues.MEDIUM]:
    "Medium: Refers to the art medium or material used. Helps classify artworks by their physical composition (e.g., 'Oil Painting', 'Sculpture', 'Digital Art').",
};

export const getCategoryTypeColor = (type: string): 'primary' | 'secondary' => {
  return type === CategoryTypeValues.ATTRIBUTE ? 'primary' : 'secondary';
};

export const CategoryTable: React.FC = () => {
  const theme = useTheme();
  const {
    filteredCategories,
    loading,
    page,
    pageSize,
    totalCount,
    setPage,
    setPageSize,
  } = useCategoryData();
  const {
    selectedIds,
    handleRowCheckboxClick,
    handleSelectAllClick,
    handleOpenCategoryDetailDialog,
    handleOpenDeleteConfirmDialog,
  } = useCategoryInterface();

  const categoryIds = filteredCategories.map((c) => c.id);
  const numSelected = selectedIds.filter((id) =>
    categoryIds.includes(id),
  ).length;
  const rowCount = filteredCategories.length;

  const handleEditClick = (category: Category) => {
    handleOpenCategoryDetailDialog(category, false);
  };

  const handleDeleteClick = (category: Category) => {
    handleOpenDeleteConfirmDialog(category);
  };

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead
            sx={{
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[800]
                  : theme.palette.grey[100],
            }}
          >
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={(event) => handleSelectAllClick(event, categoryIds)}
                  disabled={rowCount === 0}
                />
              </TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Posts</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 10 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      color: 'text.secondary',
                    }}
                  >
                    <Typography variant="h6">No categories found</Typography>
                    <Typography variant="body2">
                      Try adjusting your search or filter criteria.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = selectedIds.includes(category.id);
                return (
                  <TableRow key={category.id} hover selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={() => handleRowCheckboxClick(category.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar
                        src={category.exampleImages?.[0]}
                        variant="rounded"
                        sx={{ width: 40, height: 40 }}
                      >
                        <ImageIcon />
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={categoryTypeTooltips[category.type]}
                        arrow
                      >
                        <Chip
                          label={category.type}
                          size="small"
                          color={getCategoryTypeColor(category.type)}
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={category.description || '-'} arrow>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {category.description || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={category.postsCount || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {format(category.createdAt, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          justifyContent: 'center',
                        }}
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(category)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(category)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};
