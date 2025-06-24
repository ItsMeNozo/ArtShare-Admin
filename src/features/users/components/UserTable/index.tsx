import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  CircularProgress,
  TableRow,
  TableCell,
  Typography,
  Box,
} from "@mui/material";
import { useUserData } from "../../context/UserDataContext";
import { UserTableToolbar } from "./UserTableToolbar";
import { UserTableHeadComponent } from "./UserTableHeadComponent";
import { UserTableRowComponent } from "./UserTableRowComponent";
import { defaultHeadCells } from "../../constants/userTable.constants";

export const UserTable: React.FC = () => {
  const { displayUsers, loading, totalUsers, tableControls } = useUserData();

  return (
    <Paper sx={{ p: 3 }}>
      <UserTableToolbar />

      <TableContainer>
        <Table>
          <UserTableHeadComponent headCells={defaultHeadCells} />

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={defaultHeadCells.length + 1}
                  sx={{ textAlign: "center", border: "none", py: 10 }}
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : displayUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={defaultHeadCells.length + 1}
                  sx={{ textAlign: "center", border: "none", py: 10 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="h6">No users found</Typography>
                    <Typography variant="body2">
                      Try adjusting your search or filter criteria.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              displayUsers.map((user) => (
                <UserTableRowComponent
                  key={user.id}
                  user={user}
                  headCells={defaultHeadCells}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalUsers}
        page={tableControls.currentPage}
        rowsPerPage={tableControls.rowsPerPage}
        onPageChange={(_, newPage) => tableControls.handleChangePage(newPage)}
        onRowsPerPageChange={(e) =>
          tableControls.handleChangeRowsPerPage(parseInt(e.target.value, 10))
        }
      />
    </Paper>
  );
};
