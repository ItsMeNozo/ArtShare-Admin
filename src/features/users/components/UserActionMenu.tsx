import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useUserInterface } from '../context/UserInterfaceContext';

interface UserActionMenuProps {
  anchorEl: null | HTMLElement;
  onEdit: () => void;
  onDelete: () => void;
}

export const UserActionMenu: React.FC<UserActionMenuProps> = ({
  anchorEl,
  onEdit,
  onDelete,
}) => {
  const { handleCloseUserMenu } = useUserInterface();
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleCloseUserMenu}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <MenuItem onClick={onEdit}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} /> View / Edit
      </MenuItem>
      <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
      </MenuItem>
    </Menu>
  );
};
