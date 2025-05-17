import React from "react";
import {
  TableRow,
  TableCell,
  Checkbox,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { User } from "../../../types/user";
import { SortableUser, HeadCell } from "../types";
import { getPlanTierStyling } from "../utils/userTable.utils";

interface UserTableRowComponentProps {
  user: SortableUser;
  isSelected: boolean;
  onCheckboxClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, user: User) => void;
  headCells: readonly HeadCell[];
}

export const UserTableRowComponent: React.FC<UserTableRowComponentProps> = ({
  user,
  isSelected,
  onCheckboxClick,
  onMenuOpen,
  headCells,
}) => {
  const theme = useTheme();
  const { style: planChipStyle, variant: planChipVariant } = getPlanTierStyling(
    user,
    theme,
  );

  const showEmailColumn = headCells.some(
    (hc) => hc.id === "email" && hc.className?.includes("md:table-cell"),
  );

  return (
    <TableRow hover selected={isSelected} className="group">
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isSelected}
          onChange={onCheckboxClick}
        />
      </TableCell>
      <TableCell align="center">
        <Avatar
          src={user.profilePictureUrl || undefined}
          alt={user.username}
          sx={{ width: 36, height: 36, margin: "0 auto" }}
        >
          {(user.username || "U")[0]?.toUpperCase()}
        </Avatar>
      </TableCell>
      <TableCell align="left">
        {/* Username cell */}
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {user.username}
        </Typography>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {user.email}
        </Typography>
      </TableCell>
      <TableCell align="left">
        {/* Full Name cell */}
        {user.fullName || (
          <Typography variant="caption" color="textSecondary">
            N/A
          </Typography>
        )}
      </TableCell>

      {/* Conditional Email Cell for medium screens and up */}
      <TableCell
        align="left"
        sx={{
          display: showEmailColumn ? { xs: "none", md: "table-cell" } : "none",
        }}
        className={showEmailColumn ? "hidden md:table-cell" : "hidden"}
      >
        {user.email}
      </TableCell>

      <TableCell align="center">
        {/* Roles cell */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            justifyContent: "center",
          }}
        >
          {user.roles.map((userRole) => (
            <Chip
              key={user.id + "_" + userRole}
              label={userRole}
              size="small"
              color={userRole === "ADMIN" ? "secondary" : "default"}
              variant="outlined"
            />
          ))}
          {user.roles.length === 0 && (
            <Typography variant="caption" color="textSecondary">
              N/A
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell align="center">
        {/* Current Plan cell */}
        <Chip
          label={user.currentPlan || "N/A"}
          size="small"
          variant={planChipVariant}
          sx={planChipStyle}
        />
      </TableCell>
      <TableCell align="center">
        {/* Actions cell */}
        <IconButton
          size="small"
          onClick={(e) => {
            onMenuOpen(e, user as User);
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
