import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  Box,
  CircularProgress,
} from "@mui/material";
import { useUserData } from "../../context/UserDataContext";
import { UserTableToolbar } from "./UserTableToolbar";
import { UserTableHeadComponent } from "./UserTableHeadComponent";
import { UserTableRowComponent } from "./UserTableRowComponent";
import { defaultHeadCells } from "../../constants/userTable.constants";

export const UserTable: React.FC = () => {
  const { displayUsers, loading, totalUsers, tableControls } = useUserData();

  return (
    <Paper sx={{ p: 2 }}>
      <UserTableToolbar />
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      <TableContainer>
        <Table>
          <UserTableHeadComponent headCells={defaultHeadCells} />
          <TableBody>
            {displayUsers.map((user) => (
              <UserTableRowComponent
                key={user.id}
                user={user}
                headCells={defaultHeadCells}
              />
            ))}
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
