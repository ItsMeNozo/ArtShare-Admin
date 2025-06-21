import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface UserActionMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const UserActionMenu: React.FC<UserActionMenuProps> = ({
  anchorEl,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem onClick={onEdit}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} /> View / Edit
      </MenuItem>
      <MenuItem onClick={onDelete} sx={{ color: "error.main" }}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
      </MenuItem>
    </Menu>
  );
};
