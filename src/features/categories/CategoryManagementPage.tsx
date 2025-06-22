import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Stack,
  Menu,
  Box,
  Typography,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  useTheme,
  Checkbox,
} from "@mui/material";
// csv
import { CSVLink } from "react-csv";
// pdf
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  AddCircleOutline as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  UndoOutlined,
  MoreVertOutlined,
} from "@mui/icons-material";
import { format } from "date-fns"; // For date formatting
import type { Category, CategoryType } from "../../types/category";
import { CategoryTypeValues } from "../../types/category";
import {
  // Import your new API functions
  fetchCategories as fetchCategoriesAPI,
  addCategory as addCategoryAPI,
  updateCategory as updateCategoryAPI,
  deleteCategory as deleteCategoryAPI,
} from "./categoryAPI"; // Adjust the import path as necessary

const CategoryManagementPage: React.FC = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const filteredCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );
  const categoryTypeTooltips = {
    [CategoryTypeValues.ATTRIBUTE]:
      "Attribute: Describes characteristics or properties. Used for filtering or defining features (e.g., 'Color', 'Size', 'Style').",
    [CategoryTypeValues.MEDIUM]:
      "Medium: Refers to the art medium or material used. Helps classify artworks by their physical composition (e.g., 'Oil Painting', 'Sculpture', 'Digital Art').",
  };
  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({
    name: "",
    description: "",
    type: CategoryTypeValues.ATTRIBUTE as CategoryType,
    example_images: [],
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
    null,
  );
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);
  const MAX_IMAGES = 4;
  const DESCRIPTION_MAX_LENGTH = 255;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoriesAPI();
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAddDialog = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      description: "",
      type: CategoryTypeValues.ATTRIBUTE,
      example_images: [],
    });
    setOpenFormDialog(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || "",
      type: category.type,
      example_images: [...category.example_images], // Create a copy
    });
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setEditingCategory(null);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any,
  ) => {
    // any for Select
    const { name, value } = event.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (
      event.target.files &&
      categoryFormData.example_images &&
      categoryFormData.example_images.length < MAX_IMAGES
    ) {
      const file = event.target.files[0];
      if (file) {
        // In a real app, you'd upload this file and get a URL
        // For mock, we'll use a placeholder or the file's local URL (won't persist)
        const newImageUrl = URL.createObjectURL(file); // Temporary local URL
        setCategoryFormData((prev) => ({
          ...prev,
          example_images: [...(prev.example_images || []), newImageUrl],
        }));
      }
    }
    // Reset file input to allow selecting the same file again if removed
    event.target.value = "";
  };

  const handleImageRemove = (indexToRemove: number) => {
    setCategoryFormData((prev) => ({
      ...prev,
      example_images: (prev.example_images || []).filter(
        (_, index) => index !== indexToRemove,
      ),
    }));
  };

  const handleFormSubmit = async () => {
    if (!categoryFormData.name?.trim()) {
      // Also trim to avoid just spaces
      alert("Category name is required.");
      return;
    }
    if (!categoryFormData.description?.trim()) {
      // Also trim
      alert("Category description is required.");
      return;
    }
    // Ensure example_images are strings if your DTO expects that.
    // If you did actual file uploads, this is where you'd ensure you have the URLs.
    const payload = {
      name: categoryFormData.name,
      description: categoryFormData.description,
      type: categoryFormData.type,
      example_images: categoryFormData.example_images || [], // Ensure it's an array
    };

    setFormSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        // For update, only send fields that are part of UpdateCategoryDto
        // Prisma often ignores undefined fields, which is good for PATCH.
        await updateCategoryAPI(editingCategory.id, payload);
      } else {
        await addCategoryAPI(payload);
      }
      await fetchCategories();
      handleCloseFormDialog();
    } catch (err: any) {
      setError(
        `Failed to ${editingCategory ? "update" : "add"} category: ${err.message || "Unknown error"}`,
      );
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeletingCategoryId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingCategoryId(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCategoryId !== null) {
      setFormSubmitting(true); // Use same submitting state for delete
      setError(null);
      try {
        await deleteCategoryAPI(deletingCategoryId);
        await fetchCategories(); // Refresh list
        handleCloseDeleteDialog();
      } catch (err) {
        setError("Failed to delete category.");
        console.error(err);
      } finally {
        setFormSubmitting(false);
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");
    autoTable(doc, {
      head: [["Name", "Type", "Posts", "Blogs"]],
      body: selectedIds.map((id) => {
        const cat = categories.find((c) => c.id === id)!;
        return [
          cat.name ?? "",
          cat.type ?? "",
          cat.posts_count ?? 0,
          cat.blogs_count ?? 0,
        ];
      }),
    });
    doc.save("categories.pdf");
  };

  const handleBulkDelete = async () => {
    setFormSubmitting(true);
    setError(null);
    try {
      await Promise.all(selectedIds.map((id) => deleteCategoryAPI(id)));
      await fetchCategories();
      setSelectedIds([]);
    } catch (err) {
      setError("Failed to delete selected categories.");
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: 3,
        m: 2,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.background.paper
            : "#ffffff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="bold">
          Category Management
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: 180,
              backgroundColor:
                theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb",
              borderRadius: 2,
              "& input": {
                px: 1.5,
                py: 1,
              },
            }}
            InputProps={{
              sx: { fontSize: 14 },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            color="primary"
            sx={{ textTransform: "none" }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {selectedIds.length > 0 && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor:
              theme.palette.mode === "dark" ? "#d1d5db" : "#e5e7eb", // gray‑300
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              color: theme.palette.mode === "dark" ? "#000" : "#333",
            }}
          >
            {selectedIds.length} selected from {categories.length}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              variant="contained"
              onClick={handleBulkDelete}
              sx={{ textTransform: "none" }}
            >
              Delete
            </Button>

            <Button
              onClick={() => setSelectedIds([])}
              startIcon={<UndoOutlined />}
              sx={{ textTransform: "none" }}
            >
              Deselect all
            </Button>

            {/* More menu */}
            <Button
              variant="outlined"
              startIcon={<MoreVertOutlined />}
              onClick={(e) => setMoreAnchor(e.currentTarget)}
              sx={{ textTransform: "none" }}
            >
              More
            </Button>

            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={() => setMoreAnchor(null)}
            >
              <MenuItem>
                <CSVLink
                  data={categories}
                  filename="categories.csv"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Export CSV
                </CSVLink>
              </MenuItem>
              <MenuItem onClick={handleExportPDF}>Export PDF</MenuItem>
            </Menu>
          </Stack>
        </Box>
      )}

      <TableContainer sx={{ boxShadow: "none" }}>
        <Table sx={{ minWidth: 650 }} aria-label="categories table">
          <TableHead
            sx={{
              backgroundColor:
                theme.palette.mode === "dark" ? "#333" : "grey.200",
            }}
          >
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    filteredCategories.length > 0 &&
                    selectedIds.length >= filteredCategories.length && // Ensure we check against filtered length
                    filteredCategories.every((c) => selectedIds.includes(c.id))
                  }
                  // Check if some but not all filtered items are selected
                  indeterminate={
                    filteredCategories.some((c) =>
                      selectedIds.includes(c.id),
                    ) && // At least one filtered is selected
                    !filteredCategories.every((c) => selectedIds.includes(c.id)) // But not all filtered are selected
                  }
                  onChange={(e) => {
                    const filteredIds = filteredCategories.map((c) => c.id);
                    if (e.target.checked) {
                      // Add only filtered IDs to the current selection (prevent duplicates)
                      setSelectedIds((prev) => [
                        ...new Set([...prev, ...filteredIds]),
                      ]);
                    } else {
                      // Remove filtered IDs from the current selection
                      setSelectedIds((prev) =>
                        prev.filter((id) => !filteredIds.includes(id)),
                      );
                    }
                  }}
                  // Disable if there are no categories to select in the filtered view
                  disabled={filteredCategories.length === 0}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Examples
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Posts
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Blogs
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Created</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow
                key={category.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(category.id)}
                    onChange={(e) => {
                      setSelectedIds((prev) =>
                        e.target.checked
                          ? [...prev, category.id]
                          : prev.filter((id) => id !== category.id),
                      );
                    }}
                  />
                </TableCell>

                <TableCell component="th" scope="row">
                  <Typography variant="subtitle2" fontWeight="medium">
                    {category.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip
                    title={
                      categoryTypeTooltips[category.type] || "Category Type"
                    }
                    arrow
                    placement="top"
                  >
                    <Chip
                      label={
                        category.type.charAt(0) +
                        category.type.slice(1).toLowerCase()
                      }
                      size="small"
                      color={
                        category.type === CategoryTypeValues.MEDIUM
                          ? "primary"
                          : "secondary"
                      }
                      sx={{ textTransform: "capitalize", fontWeight: "medium" }}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Tooltip
                    title={category.description || ""}
                    placement="top-start"
                  >
                    <span>{category.description || "N/A"}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  {category.example_images.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      {category.example_images.slice(0, 2).map(
                        (
                          imgUrl,
                          idx, // Show max 2 thumbnails in table
                        ) => (
                          <Avatar
                            key={idx}
                            src={imgUrl}
                            variant="rounded"
                            sx={{ width: 32, height: 32 }}
                          >
                            <ImageIcon />
                          </Avatar>
                        ),
                      )}
                      {category.example_images.length > 2 && (
                        <Tooltip
                          title={`${category.example_images.length} images`}
                        >
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "action.hover",
                            }}
                          >
                            +{category.example_images.length - 2}
                          </Avatar>
                        </Tooltip>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {category.posts_count ?? 0}
                </TableCell>
                <TableCell align="center">
                  {category.blogs_count ?? 0}
                </TableCell>
                <TableCell>
                  {format(new Date(category.created_at), "PP")}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Category">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditDialog(category)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Category">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteDialog(category.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {filteredCategories.length === 0 && (
              <TableRow>
                {/* Adjust colSpan based on the number of columns (including checkbox) */}
                <TableCell colSpan={9} align="center">
                  <Typography color="textSecondary">
                    {search
                      ? "No categories match your search."
                      : "No categories found."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit Category Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Add New Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryFormData.name || ""}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label={`Description (max ${DESCRIPTION_MAX_LENGTH} chars)`}
            type="text"
            fullWidth
            multiline
            rows={3}
            required
            variant="outlined"
            value={categoryFormData.description || ""}
            onChange={handleInputChange}
            inputProps={{ maxLength: DESCRIPTION_MAX_LENGTH }}
            helperText={`${(categoryFormData.description || "").length}/${DESCRIPTION_MAX_LENGTH}`}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="category-type-label">Type</InputLabel>
            <Select
              labelId="category-type-label"
              name="type"
              value={categoryFormData.type || CategoryTypeValues.ATTRIBUTE}
              label="Type"
              onChange={handleInputChange}
            >
              <MenuItem value={CategoryTypeValues.ATTRIBUTE} selected>
                <Tooltip
                  title={categoryTypeTooltips[CategoryTypeValues.ATTRIBUTE]}
                  arrow
                  placement="right"
                >
                  <Box width={"100%"}>Attribute</Box>
                </Tooltip>
              </MenuItem>

              <MenuItem value={CategoryTypeValues.MEDIUM}>
                <Tooltip
                  title={categoryTypeTooltips[CategoryTypeValues.MEDIUM]}
                  arrow
                  placement="right"
                >
                  <Box width={"100%"}>Medium</Box>
                </Tooltip>
              </MenuItem>
            </Select>
          </FormControl>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Example Images (Max {MAX_IMAGES})
          </Typography>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {(categoryFormData.example_images || []).map((imgUrl, index) => (
              <Grid key={index}>
                <Box sx={{ position: "relative", width: 80, height: 80 }}>
                  <Avatar
                    src={imgUrl}
                    variant="rounded"
                    sx={{ width: "100%", height: "100%" }}
                  >
                    <ImageIcon />
                  </Avatar>
                  <IconButton
                    size="small"
                    onClick={() => handleImageRemove(index)}
                    sx={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                      p: 0.2,
                    }}
                  >
                    <CloseIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
            {(categoryFormData.example_images || []).length < MAX_IMAGES && (
              <Grid>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    width: 80,
                    height: 80,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: "divider",
                  }}
                >
                  <ImageIcon />
                  Add
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageAdd}
                  />
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: "0 24px 16px" }}>
          <Button
            onClick={handleCloseFormDialog}
            color="inherit"
            disabled={formSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            color="primary"
            disabled={formSubmitting}
          >
            {formSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : editingCategory ? (
              "Save Changes"
            ) : (
              "Add Category"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "
            {categories.find((c) => c.id === deletingCategoryId)?.name || ""}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            color="inherit"
            disabled={formSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CategoryManagementPage;
