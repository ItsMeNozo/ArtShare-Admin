import React, { useMemo, useCallback, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Menu,
  MenuItem,
  useTheme,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  UndoOutlined as UndoOutlinedIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
  Search as SearchIcon,
  MoreVertOutlined,
} from "@mui/icons-material";
import { CSVLink } from "react-csv";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { usePostsData } from "../context/PostsDataContext";
import { usePostsUI } from "../context/PostsUIContext";
import { useGetCategories } from "../hooks/useCategoryQueries";

interface TableToolbarProps {
  onBulkDelete: () => void;
  title?: string;
  isActionLoading?: boolean;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  onBulkDelete,
  title,
  isActionLoading = false,
}) => {
  const theme = useTheme();
  const { posts, tableControls } = usePostsData();
  const { selected, handleDeselectAll } = usePostsUI();
  const { data: categories = [] } = useGetCategories();
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };
  const handleMoreMenuClose = () => {
    setMoreAnchor(null);
  };

  const getDataForExport = useCallback(() => {
    return selected.length > 0
      ? posts.filter((p) => selected.includes(p.id))
      : posts;
  }, [posts, selected]);

  const csvFormattedData = useMemo(() => {
    const dataToExport = getDataForExport();
    return dataToExport.map((post) => ({
      ID: post.id,
      Title: post.title,
      Author: post.user.username,
      CreatedAt: format(new Date(post.createdAt), "yyyy-MM-dd HH:mm:ss"),
    }));
  }, [getDataForExport]);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF("landscape");
    const dataToExport = getDataForExport();
    autoTable(doc, {
      head: [["ID", "Title", "Author", "Created At"]],
      body: dataToExport.map((p) => [
        p.id,
        p.title,
        p.user.username,
        format(new Date(p.createdAt), "MMM dd, yyyy"),
      ]),
      startY: 20,
      didDrawPage: (data) => {
        doc.setFontSize(16);
        doc.text("Admin Posts Report", data.settings.margin.left || 15, 15);
      },
    });
    doc.save("admin-posts-report.pdf");
  }, [getDataForExport]);

  const csvHeaders = [
    { label: "ID", key: "ID" },
    { label: "Title", key: "Title" },
    { label: "Author", key: "Author" },
    { label: "Created At", key: "CreatedAt" },
  ];

  return (
    <>
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
        {title ? (
          <Typography variant="h5" component="h1" fontWeight="bold">
            {title}
          </Typography>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="ai-filter-label">Content type</InputLabel>
            <Select
              labelId="ai-filter-label"
              value={
                tableControls.aiCreated === null
                  ? ""
                  : String(tableControls.aiCreated)
              }
              label="Content type"
              onChange={(e) => {
                const value = e.target.value;
                if (value === "true") tableControls.setAiCreated(true);
                else if (value === "false") tableControls.setAiCreated(false);
                else tableControls.setAiCreated(null);
              }}
            >
              <MenuItem value="">
                <em>All content</em>
              </MenuItem>
              <MenuItem value="true">AI Created</MenuItem>
              <MenuItem value="false">Human Created</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              id="category-filter-select"
              value={tableControls.categoryId ?? ""}
              label="Category"
              onChange={(e) => {
                const value = e.target.value;
                tableControls.setCategoryId(value ? Number(value) : null);
              }}
            >
              <MenuItem value="">
                <em>All categories</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            variant="outlined"
            placeholder="Search posts..."
            value={tableControls.searchTerm}
            onChange={(e) => tableControls.setSearchTerm(e.target.value)}
            sx={{
              minWidth: { xs: "100%", sm: 200, md: 250 },
              maxWidth: { sm: 400 },
              backgroundColor:
                theme.palette.mode === "dark" ? "grey.800" : "grey.50",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                fontSize: "0.9rem",
                "& fieldset": {
                  borderColor:
                    theme.palette.mode === "dark" ? "grey.700" : "grey.300",
                },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {selected.length > 0 && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor:
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
            {selected.length} post(s) selected
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap gap={1}>
            <Button
              startIcon={
                isActionLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DeleteIcon />
                )
              }
              color="error"
              variant="contained"
              onClick={onBulkDelete}
              size="small"
              sx={{ textTransform: "none" }}
              disabled={isActionLoading}
            >
              Delete
            </Button>
            <Button
              onClick={handleDeselectAll}
              startIcon={<UndoOutlinedIcon />}
              variant="outlined"
              size="small"
              disabled={isActionLoading}
            >
              Deselect all
            </Button>
            <Button
              variant="outlined"
              startIcon={<MoreVertOutlined />}
              onClick={handleMoreMenuOpen}
              disabled={isActionLoading}
            >
              More
            </Button>
            <Menu
              id="export-menu"
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={handleMoreMenuClose}
            >
              <MenuItem onClick={handleMoreMenuClose}>
                <CSVLink
                  data={csvFormattedData}
                  headers={csvHeaders}
                  filename="admin-posts.csv"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                  target="_blank"
                >
                  <FileDownloadOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Export CSV
                </CSVLink>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleExportPDF();
                  handleMoreMenuClose();
                }}
                disabled={isActionLoading}
              >
                <FileDownloadOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                Export PDF
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default TableToolbar;
