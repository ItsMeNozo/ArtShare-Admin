import React from "react";
import {
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  TableSortLabel,
  Box,
  useTheme,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { HeadCell, Order, UserSortableKeys } from "../types";

interface UserTableHeadComponentProps<T = any> {
  headCells: ReadonlyArray<HeadCell<T>>;
  order: Order;
  orderBy: UserSortableKeys;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: UserSortableKeys,
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  numSelected: number;
  rowCount: number;
}

export const UserTableHeadComponent: React.FC<UserTableHeadComponentProps> = ({
  headCells,
  order,
  orderBy,
  onRequestSort,
  onSelectAllClick,
  numSelected,
  rowCount,
}) => {
  const theme = useTheme();

  return (
    <TableHead
      sx={{
        backgroundColor:
          theme.palette.mode === "dark"
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
            onChange={(event) => onSelectAllClick(event)}
            disabled={rowCount === 0}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || (headCell.numeric ? "right" : "left")}
            sortDirection={
              headCell.sortable && orderBy === headCell.id ? order : false
            }
            className={headCell.className}
            style={{ minWidth: headCell.minWidth, fontWeight: "bold" }}
            sx={{
              display: headCell.className?.includes("md:table-cell")
                ? { xs: "none", md: "table-cell" }
                : undefined,
            }}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={(event) => onRequestSort(event, headCell.id)}
              >
                {headCell.label}
                {orderBy === (headCell.id as UserSortableKeys) ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
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
