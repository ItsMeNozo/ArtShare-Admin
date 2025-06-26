import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Chip,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useCategoryData } from "../context/CategoryDataContext";
import { useCategoryInterface } from "../context/CategoryInterfaceContext";
import { Category, CategoryTypeValues } from "../../../types/category";

const categoryTypeTooltips = {
  [CategoryTypeValues.ATTRIBUTE]:
    "Attribute: Describes characteristics or properties. Used for filtering or defining features (e.g., 'Color', 'Size', 'Style').",
  [CategoryTypeValues.MEDIUM]:
    "Medium: Refers to the art medium or material used. Helps classify artworks by their physical composition (e.g., 'Oil Painting', 'Sculpture', 'Digital Art').",
};

const getCategoryTypeColor = (type: string): "primary" | "secondary" => {
  return type === CategoryTypeValues.ATTRIBUTE ? "primary" : "secondary";
};

export const CategoryTable: React.FC = () => {
  const theme = useTheme();
  const { filteredCategories, loading } = useCategoryData();
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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead
          sx={{
            backgroundColor:
              theme.palette.mode === "dark"
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
              <TableCell colSpan={8} sx={{ textAlign: "center", py: 10 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : filteredCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} sx={{ textAlign: "center", py: 10 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    color: "text.secondary",
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
                      src={category.example_images?.[0]}
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
                    <Tooltip title={categoryTypeTooltips[category.type]} arrow>
                      <Chip
                        label={category.type}
                        size="small"
                        color={getCategoryTypeColor(category.type)}
                        variant="outlined"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={category.posts_count || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(category.created_at, "MMM dd, yyyy")}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
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
                          sx={{ color: "error.main" }}
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
  );
};
