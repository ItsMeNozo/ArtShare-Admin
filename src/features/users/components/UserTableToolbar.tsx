import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Menu,
  MenuItem,
  Theme,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  UndoOutlined,
  MoreVertOutlined,
} from "@mui/icons-material";
import { CSVLink } from "react-csv";
import { UserStatus } from "../../../constants/user";
import { UserRoleType } from "../../../constants/roles";

interface UserTableToolbarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: UserStatus | "ALL";
  onStatusFilterChange: (event: SelectChangeEvent<UserStatus | "ALL">) => void;
  roleFilter: UserRoleType | "ALL";
  onRoleFilterChange: (event: SelectChangeEvent<UserRoleType | "ALL">) => void;
  onAddUser: () => void;
  selectedIdsCount: number;
  onBulkDelete: () => void;
  onDeselectAll: () => void;
  onExportPDF: () => void;
  csvFormattedData: Array<Record<string, any>>;
  theme: Theme;
}

export const UserTableToolbar: React.FC<UserTableToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  onAddUser,
  selectedIdsCount,
  onBulkDelete,
  onDeselectAll,
  onExportPDF,
  csvFormattedData,
}) => {
  const theme = useTheme();
  const [moreAnchor, setMoreAnchor] = React.useState<null | HTMLElement>(null);

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreAnchor(null);
  };

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
          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter-select"
              value={statusFilter}
              label="Status"
              onChange={onStatusFilterChange}
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb",
                borderRadius: 2,
              }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value={UserStatus.ACTIVE}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.success.main,
                    }}
                  />
                  Active
                </Box>
              </MenuItem>
              <MenuItem value={UserStatus.INACTIVE}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.grey[500],
                    }}
                  />
                  Inactive
                </Box>
              </MenuItem>
              <MenuItem value={UserStatus.SUSPENDED}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.error.main,
                    }}
                  />
                  Suspended
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Role Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              id="role-filter-select"
              value={roleFilter}
              label="Role"
              onChange={onRoleFilterChange}
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark" ? "#1f2937" : "#f9fafb",
                borderRadius: 2,
              }}
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="ADMIN">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.secondary.main,
                    }}
                  />
                  Admin
                </Box>
              </MenuItem>
              <MenuItem value="USER">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.grey[500],
                    }}
                  />
                  User
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Search Filter */}
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search…"
            value={searchTerm}
            onChange={onSearchChange}
            sx={{
              width: { xs: "100%", sm: 180 },
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
            onClick={onAddUser}
            color="primary"
            sx={{ textTransform: "none" }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {selectedIdsCount > 0 && (
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
            {selectedIdsCount} selected
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {" "}
            {/* Allow stack to wrap */}
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              variant="contained"
              onClick={onBulkDelete}
              sx={{ textTransform: "none" }}
            >
              Delete
            </Button>
            <Button
              onClick={onDeselectAll}
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
              <MenuItem
                onClick={() => {
                  handleMoreMenuClose();
                }}
              >
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
              <MenuItem
                onClick={() => {
                  onExportPDF();
                  handleMoreMenuClose();
                }}
              >
                Export PDF
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
      )}
    </>
  );
};
