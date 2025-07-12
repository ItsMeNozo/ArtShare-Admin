import {
  Box,
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  useTheme,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import React from 'react';
import { HeadCell } from '../../types';

import { useUserData } from '../../context/UserDataContext';
import { useUserInterface } from '../../context/UserInterfaceContext';

interface UserTableHeadComponentProps {
  headCells: ReadonlyArray<HeadCell<any>>;
}

export const UserTableHeadComponent: React.FC<UserTableHeadComponentProps> = ({
  headCells,
}) => {
  const theme = useTheme();

  const { displayUsers, tableControls } = useUserData();
  const { order, orderBy, handleSortRequest } = tableControls;
  const { selectedIds, handleSelectAllClickOnPage } = useUserInterface();
  const userIdsOnPage = displayUsers.map((u) => u.id);
  const rowCount = displayUsers.length;
  const numSelected = selectedIds.filter((id) =>
    userIdsOnPage.includes(id),
  ).length;

  return (
    <TableHead
      sx={{
        backgroundColor:
          theme.palette.mode === 'dark'
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
            onChange={(event) =>
              handleSelectAllClickOnPage(event, userIdsOnPage)
            }
            disabled={rowCount === 0}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || (headCell.numeric ? 'right' : 'left')}
            sortDirection={
              headCell.sortable && orderBy === headCell.id ? order : false
            }
            className={headCell.className}
            style={{ minWidth: headCell.minWidth, fontWeight: 'bold' }}
            sx={{
              display: headCell.className?.includes('md:table-cell')
                ? { xs: 'none', md: 'table-cell' }
                : undefined,
            }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => handleSortRequest(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
