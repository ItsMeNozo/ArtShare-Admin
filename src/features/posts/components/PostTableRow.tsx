import React from 'react';
import {
  TableRow,
  TableCell,
  Checkbox,
  Avatar,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { format } from 'date-fns';

import { usePostsUI } from '../context/PostsUIContext';
import { PostListItemDto } from '../types/post-api.types';

interface PostTableRowProps {
  post: PostListItemDto;
}

const PostTableRow: React.FC<PostTableRowProps> = React.memo(({ post }) => {
  const { selected, handleSelectRow, handleMenuOpen, currentPostForMenu } =
    usePostsUI();

  const isSelected = selected.includes(post.id);
  const isMenuCurrentlyOpenForThisRow = currentPostForMenu?.id === post.id;

  const MAX_CATEGORIES_DISPLAY = 3;
  const displayCategories = post.categories.slice(0, MAX_CATEGORIES_DISPLAY);
  const hiddenCategoriesCount =
    post.categories.length - displayCategories.length;
  const tooltipTitle =
    hiddenCategoriesCount > 0
      ? post.categories.map((cat) => cat.name).join(', ')
      : '';

  return (
    <TableRow
      hover
      onClick={(event) => handleSelectRow(event, post.id)}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={-1}
      key={post.id}
      selected={isSelected}
      sx={{
        cursor: 'pointer',
      }}
    >
      <TableCell
        padding="checkbox"
        onClick={(event) => event.stopPropagation()}
      >
        <Checkbox
          color="primary"
          checked={isSelected}
          onChange={(event) => handleSelectRow(event, post.id)}
          inputProps={{ 'aria-labelledby': `select-post-${post.id}` }}
        />
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {post.id}
        </Typography>
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={post.thumbnail_url}
            alt={post.title}
            variant="rounded"
            sx={{ width: 48, height: 48 }}
          />
          <Tooltip title={post.title}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 500, maxWidth: 350 }}
            >
              {post.title}
            </Typography>
          </Tooltip>
        </Box>
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {post.user.profile_picture_url && (
            <Avatar
              src={post.user.profile_picture_url}
              sx={{ width: 24, height: 24 }}
            />
          )}
          <Tooltip title={post.user.username}>
            <Typography variant="body2" noWrap>
              {post.user.username}
            </Typography>
          </Tooltip>
        </Box>
      </TableCell>

      <TableCell align="center">
        <Tooltip
          title={tooltipTitle}
          placement="top"
          disableHoverListener={!hiddenCategoriesCount}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 0.5,
              pt: 0.5,
            }}
          >
            {displayCategories.map((category) => (
              <Chip key={category.id} label={category.name} size="small" />
            ))}

            {hiddenCategoriesCount > 0 && (
              <Chip
                label={`+${hiddenCategoriesCount}`}
                size="small"
                variant="outlined"
              />
            )}

            {post.categories.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                --
              </Typography>
            )}
          </Box>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Tooltip
          title={format(new Date(post.created_at), 'yyyy-MM-dd HH:mm:ss')}
        >
          <Typography variant="body2" color="text.secondary">
            {format(new Date(post.created_at), 'MMM dd, yyyy')}
          </Typography>
        </Tooltip>
      </TableCell>

      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, post)}
          aria-label={`actions for post ${post.id}`}
          id={`actions-button-for-post-${post.id}`}
          aria-haspopup="true"
          aria-controls={
            isMenuCurrentlyOpenForThisRow
              ? `actions-menu-for-post-${post.id}`
              : undefined
          }
          aria-expanded={isMenuCurrentlyOpenForThisRow ? 'true' : undefined}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

PostTableRow.displayName = 'PostTableRow';
export default PostTableRow;
