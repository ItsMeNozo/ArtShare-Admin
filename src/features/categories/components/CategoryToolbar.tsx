import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Menu,
  Toolbar,
  Alert,
  Collapse,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CategoryType, CategoryTypeValues } from "../../../types/category";
import { useCategoryData } from "../context/CategoryDataContext";
import { useCategoryInterface } from "../context/CategoryInterfaceContext";

export const CategoryToolbar: React.FC = () => {
  const {
    searchTerm,
    typeFilter,
    setSearchTerm,
    setTypeFilter,
    filteredCategories,
    error,
  } = useCategoryData();
  const {
    selectedIds,
    handleOpenCategoryDetailDialog,
    handleOpenBulkDeleteDialog,
    resetSelection,
  } = useCategoryInterface();

  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreAnchor(null);
  };

  const handleTypeFilterChange = (
    event: SelectChangeEvent<CategoryType | "ALL">,
  ) => {
    setTypeFilter(event.target.value as CategoryType | "ALL");
  };

  const getDataForExport = useCallback(() => {
    return selectedIds.length > 0
      ? filteredCategories.filter((c) => selectedIds.includes(c.id))
      : filteredCategories;
  }, [filteredCategories, selectedIds]);

  const csvFormattedData = useMemo(() => {
    const dataToExport = getDataForExport();
    return dataToExport.map((category) => ({
      Name: category.name,
      Type: category.type,
      Description: category.description || "",
      "Posts Count": category.posts_count || 0,
      "Created Date": new Date(category.created_at).toLocaleDateString(),
    }));
  }, [getDataForExport]);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF("landscape");
    const dataToExport = getDataForExport();
    const pdfData = dataToExport.map((category) => [
      category.name,
      category.type,
      category.description || "",
      category.posts_count || 0,
      new Date(category.created_at).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["Name", "Type", "Description", "Posts", "Created Date"]],
      body: pdfData,
    });
    doc.save("categories.pdf");
    handleMoreMenuClose();
  }, [getDataForExport, handleMoreMenuClose]);

  return (
    <>
      {error && (
        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Collapse>
      )}

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
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              label="Type"
            >
              <MenuItem value="ALL">All Types</MenuItem>
              {Object.values(CategoryTypeValues).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Search categories"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCategoryDetailDialog(null, true)}
          >
            Add Category
          </Button>
          <IconButton onClick={handleMoreMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {selectedIds.length > 0 && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(0, 0, 0, 0.04)",
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {selectedIds.length} selected
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleOpenBulkDeleteDialog}
            sx={{ mr: 1 }}
          >
            Delete Selected
          </Button>
          <Button variant="outlined" onClick={resetSelection}>
            Clear Selection
          </Button>
        </Toolbar>
      )}

      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={handleMoreMenuClose}
      >
        <CSVLink
          data={csvFormattedData}
          filename="categories.csv"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <MenuItem onClick={handleMoreMenuClose}>
            <FileDownloadIcon sx={{ mr: 1 }} />
            Export CSV
          </MenuItem>
        </CSVLink>
        <MenuItem onClick={handleExportPDF}>
          <PdfIcon sx={{ mr: 1 }} />
          Export PDF
        </MenuItem>
      </Menu>
    </>
  );
};
