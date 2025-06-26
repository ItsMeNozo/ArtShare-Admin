import React from "react";
import {
  TableRow,
  TableCell,
  Checkbox,
  Avatar,
  Typography,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { format } from "date-fns";

import { AdminBlogListItemDto } from "../api/blog.api";
import { CustomHeadCell } from "../../posts/types/table.types";

// export type CustomHeadCell = {
//   align?: "left" | "right" | "center" | "justify" | "inherit";
//   minWidth?: number;
//   maxWidth?: number;
//   cellMaxWidth?: number;
//   disablePadding?: boolean;
//   truncate?: boolean;
//   wrap?: boolean;
// };

interface AdminPostTableRowProps {
  blog: AdminBlogListItemDto;
  isSelected: boolean;
  headCellConfigs: {
    selectCellConfig: CustomHeadCell;
    idCellConfig: CustomHeadCell;
    titleCellConfig: CustomHeadCell;
    userCellConfig: CustomHeadCell;
    createdAtCellConfig: CustomHeadCell;
    actionsCellConfig: CustomHeadCell;
  };
  onSelectRow: (id: number) => void;
  onMenuOpen: (
    event: React.MouseEvent<HTMLButtonElement>,
    blog: AdminBlogListItemDto,
  ) => void;
  isMenuCurrentlyOpenForThisRow: boolean;
}

const AdminPostTableRow: React.FC<AdminPostTableRowProps> = React.memo(
  ({
    blog,
    isSelected,
    headCellConfigs,
    onSelectRow,
    onMenuOpen,
    isMenuCurrentlyOpenForThisRow,
  }) => {
    const {
      selectCellConfig,
      idCellConfig,
      titleCellConfig,
      userCellConfig,
      createdAtCellConfig,
      actionsCellConfig,
    } = headCellConfigs;

    const handleCheckboxClick = () => {
      onSelectRow(blog.id);
    };

    return (
      <TableRow
        hover
        onClick={() => onSelectRow(blog.id)}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        key={blog.id}
        selected={isSelected}
        sx={{
          cursor: "pointer",
        }}
      >
        <TableCell
          padding={selectCellConfig.disablePadding ? "none" : "normal"}
          align={selectCellConfig.align}
          style={{
            minWidth: selectCellConfig.minWidth,
            maxWidth:
              selectCellConfig.maxWidth || selectCellConfig.cellMaxWidth,
          }}
          onClick={(event) => {
            event.stopPropagation();
            handleCheckboxClick();
          }}
        >
          <Checkbox
            color="primary"
            checked={isSelected}
            onChange={handleCheckboxClick}
            onClick={(event) => event.stopPropagation()}
            inputProps={{ "aria-labelledby": `select-post-${blog.id}` }}
          />
        </TableCell>
        <TableCell
          align={idCellConfig.align}
          style={{
            minWidth: idCellConfig.minWidth,
            maxWidth: idCellConfig.maxWidth || idCellConfig.cellMaxWidth,
          }}
        >
          {blog.id}
        </TableCell>
        <TableCell
          align={titleCellConfig.align}
          style={{
            minWidth: titleCellConfig.minWidth,
            maxWidth: titleCellConfig.maxWidth || titleCellConfig.cellMaxWidth,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                titleCellConfig.align === "center" ? "center" : "flex-start",
            }}
          >
            <Avatar
              // src={blog.}
              variant="rounded"
              sx={{ mr: 1.5, width: 48, height: 48 }}
            />
            {titleCellConfig.truncate ? (
              <Tooltip title={blog.title}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {blog.title}
                </Typography>
              </Tooltip>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  whiteSpace: titleCellConfig.wrap ? "normal" : "nowrap",
                }}
              >
                {blog.title}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell
          align={userCellConfig.align}
          style={{
            minWidth: userCellConfig.minWidth,
            maxWidth: userCellConfig.maxWidth || userCellConfig.cellMaxWidth,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                userCellConfig.align === "center" ? "center" : "flex-start",
            }}
          >
            {/* {blog.user.profile_picture_url && (
              <Avatar
                src={blog.user.profile_picture_url}
                sx={{ width: 24, height: 24, mr: 1 }}
              />
            )} */}
            {userCellConfig.truncate ? (
              <Tooltip title={String(blog.user_id)}>
                <Typography variant="body2" noWrap>
                  {blog.user_id}
                </Typography>
              </Tooltip>
            ) : (
              <Typography
                variant="body2"
                sx={{ whiteSpace: userCellConfig.wrap ? "normal" : "nowrap" }}
              >
                {blog.user_id}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell
          align={createdAtCellConfig.align}
          style={{
            minWidth: createdAtCellConfig.minWidth,
            maxWidth:
              createdAtCellConfig.maxWidth || createdAtCellConfig.cellMaxWidth,
          }}
        >
          {format(new Date(blog.created_at), "MMM dd, yyyy HH:mm")}
        </TableCell>
        <TableCell
          align={actionsCellConfig.align}
          style={{
            minWidth: actionsCellConfig.minWidth,
            maxWidth:
              actionsCellConfig.maxWidth || actionsCellConfig.cellMaxWidth,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <IconButton
            size="small"
            onClick={(e) => onMenuOpen(e, blog)}
            aria-label={`actions for blog ${blog.id}`}
            id={`actions-button-for-blog-${blog.id}`}
            aria-haspopup="true"
            aria-controls={
              isMenuCurrentlyOpenForThisRow
                ? `actions-menu-for-blog-${blog.id}`
                : undefined
            }
            aria-expanded={isMenuCurrentlyOpenForThisRow ? "true" : undefined}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  },
);

AdminPostTableRow.displayName = "AdminBlogTableRow";
export default AdminPostTableRow;
