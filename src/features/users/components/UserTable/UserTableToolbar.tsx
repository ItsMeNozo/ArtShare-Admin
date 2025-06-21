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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  UndoOutlined,
  MoreVertOutlined,
} from "@mui/icons-material";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useUserInterface } from "../../context/UserInterfaceContext";
import { useUserData } from "../../context/UserDataContext";

export const UserTableToolbar: React.FC = () => {
  const theme = useTheme();
  const {
    selectedIds,
    handleOpenUserDetailDialog,
    handleOpenBulkDeleteDialog,
    resetSelection,
  } = useUserInterface();
  const { displayUsers, tableControls } = useUserData();
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreAnchor(null);
  };

  const getDataForExport = useCallback(() => {
    return selectedIds.length > 0
      ? displayUsers.filter((u) => selectedIds.includes(u.id))
      : displayUsers;
  }, [displayUsers, selectedIds]);

  const csvFormattedData = useMemo(() => {
    const dataToExport = getDataForExport();
    return dataToExport.map((user) => ({
      Username: user.username,
      FullName: user.fullName || "",
      Email: user.email,
      Roles:
        user.roles
          ?.map((r: any) => (typeof r === "string" ? r : r.name))
          .join(" | ") || "",
      "Current Plan": user.currentPlan || "N/A",
      "Joined Date": user.createdAt
        ? new Date(user.createdAt).toLocaleDateString()
        : "N/A",
    }));
  }, [getDataForExport]);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF("landscape");
    const dataToExport = getDataForExport();
    const pdfData = dataToExport.map((user) => [
      user.username ?? "",
      user.fullName ?? "",
      user.email ?? "",
      user.roles
        ?.map((r: any) => (typeof r === "string" ? r : r.name))
        .join(", ") || "",
      user.currentPlan ?? "N/A",
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
    ]);
    autoTable(doc, {
      head: [
        [
          "Username",
          "Full Name",
          "Email",
          "Roles",
          "Current Plan",
          "Joined Date",
        ],
      ],
      body: pdfData,
    });
    doc.save("users-page.pdf");
    handleMoreMenuClose();
  }, [getDataForExport]);

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
        <Typography variant="h5" component="h1" fontWeight="bold">
          User Management
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search…"
            value={tableControls.searchTerm}
            onChange={(e) => tableControls.handleSearchChange(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 180 },
              backgroundColor:
                theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb",
              borderRadius: 2,
              "& input": { px: 1.5, py: 1 },
            }}
            InputProps={{ sx: { fontSize: 14 } }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenUserDetailDialog(null, true)}
            color="primary"
            sx={{ textTransform: "none" }}
          >
            Add User
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
          <Typography sx={{ color: theme.palette.text.primary }}>
            {selectedIds.length} selected
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              variant="contained"
              onClick={handleOpenBulkDeleteDialog}
              sx={{ textTransform: "none" }}
            >
              Delete
            </Button>
            <Button
              onClick={resetSelection}
              startIcon={<UndoOutlined />}
              sx={{ textTransform: "none" }}
              variant="outlined"
            >
              Deselect all
            </Button>
            <Button
              variant="outlined"
              startIcon={<MoreVertOutlined />}
              onClick={handleMoreMenuOpen}
              sx={{ textTransform: "none" }}
            >
              More
            </Button>
            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={handleMoreMenuClose}
            >
              <MenuItem onClick={handleMoreMenuClose}>
                <CSVLink
                  data={csvFormattedData}
                  headers={[
                    { label: "Username", key: "Username" },
                    { label: "Full Name", key: "FullName" },
                    { label: "Email", key: "Email" },
                    { label: "Roles", key: "Roles" },
                    { label: "Current Plan", key: "Current Plan" },
                    { label: "Joined Date", key: "Joined Date" },
                  ]}
                  filename="users.csv"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    width: "100%",
                    display: "block",
                  }}
                  target="_blank"
                >
                  Export CSV
                </CSVLink>
              </MenuItem>
              <MenuItem onClick={handleExportPDF}>Export PDF</MenuItem>
            </Menu>
          </Stack>
        </Box>
      )}
    </>
  );
};
