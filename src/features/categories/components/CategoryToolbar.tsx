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
  Menu,
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
      "Example Images": category.example_images?.length || 0,
      "Created Date": new Date(category.created_at).toLocaleDateString(),
      "Updated Date": category.updated_at
        ? new Date(category.updated_at).toLocaleDateString()
        : "Never",
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
      category.example_images?.length || 0,
      new Date(category.created_at).toLocaleDateString(),
      category.updated_at
        ? new Date(category.updated_at).toLocaleDateString()
        : "Never",
    ]);

    autoTable(doc, {
      head: [
        [
          "Name",
          "Type",
          "Description",
          "Posts",
          "Images",
          "Created",
          "Updated",
        ],
      ],
      body: pdfData,
      columnStyles: {
        0: { cellWidth: 30 }, // Name
        1: { cellWidth: 20 }, // Type
        2: { cellWidth: 40 }, // Description
        3: { cellWidth: 15 }, // Posts
        4: { cellWidth: 15 }, // Images
        5: { cellWidth: 25 }, // Created
        6: { cellWidth: 25 }, // Updated
      },
    });
    doc.save(`categories-export-${new Date().toISOString().split("T")[0]}.pdf`);
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
          <Button
            variant="outlined"
            startIcon={<MoreVertIcon />}
            onClick={handleMoreMenuOpen}
            sx={{ textTransform: "none" }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {selectedIds.length > 0 && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette.grey[700]
                : theme.palette.grey[200],
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            {selectedIds.length} category(ies) selected
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenBulkDeleteDialog}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Delete Selected
            </Button>
            <Button
              variant="outlined"
              onClick={resetSelection}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Clear Selection
            </Button>
            <Button
              variant="outlined"
              startIcon={<MoreVertIcon />}
              onClick={handleMoreMenuOpen}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Export
            </Button>
          </Box>
        </Box>
      )}

      <Menu
        anchorEl={moreAnchor}
        open={Boolean(moreAnchor)}
        onClose={handleMoreMenuClose}
      >
        <CSVLink
          data={csvFormattedData}
          filename={`categories-export-${new Date().toISOString().split("T")[0]}.csv`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <MenuItem onClick={handleMoreMenuClose}>
            <FileDownloadIcon sx={{ mr: 1 }} />
            Export{" "}
            {selectedIds.length > 0 ? `${selectedIds.length} Selected as ` : ""}
            CSV
          </MenuItem>
        </CSVLink>
        <MenuItem onClick={handleExportPDF}>
          <PdfIcon sx={{ mr: 1 }} />
          Export{" "}
          {selectedIds.length > 0 ? `${selectedIds.length} Selected as ` : ""}
          PDF
        </MenuItem>
      </Menu>
    </>
  );
};
