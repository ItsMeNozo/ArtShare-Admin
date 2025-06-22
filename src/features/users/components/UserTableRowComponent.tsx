import React from 'react';
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
  Tooltip,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { User } from '../../../types/user';
import { HeadCell } from '../types';
import {
  getPlanTierStyling,
  getStatusChipProps,
  getPrimaryRole,
} from '../utils/userTable.utils';

interface DisplayUser extends User {
  currentPlan?: string;
}

interface UserTableRowComponentProps {
  user: DisplayUser;
  isSelected: boolean;
  onCheckboxClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, user: DisplayUser) => void;
  headCells: ReadonlyArray<
    HeadCell<DisplayUser> & {
      truncate?: boolean;
      wrap?: boolean;
      cellMaxWidth?: string;
    }
  >;
}

export const UserTableRowComponent: React.FC<UserTableRowComponentProps> = ({
  user,
  isSelected,
  onCheckboxClick,
  onMenuOpen,
  headCells,
}) => {
  const theme = useTheme();

  const getCellContent = (
    headCell: HeadCell<DisplayUser> & {
      truncate?: boolean;
      wrap?: boolean;
      cellMaxWidth?: string;
    },
    currentUser: DisplayUser,
  ): React.ReactNode => {
    if (headCell.render) {
      return headCell.render(currentUser);
    }

    const value = currentUser[headCell.id as keyof DisplayUser] as any;
    let contentString =
      value !== undefined && value !== null ? String(value) : '';
    const defaultMaxWidth = headCell.minWidth
      ? `${Number(headCell.minWidth) + 50}px`
      : '150px';

    if (typeof contentString === 'string' && contentString.length > 0) {
      // Prioritize explicit headCell config for truncation/wrapping
      if (headCell.truncate) {
        return (
          <Tooltip title={contentString} placement="bottom-start">
            <Typography
              variant="body2"
              noWrap
              sx={{ maxWidth: headCell.cellMaxWidth || defaultMaxWidth }}
            >
              {contentString}
            </Typography>
          </Tooltip>
        );
      }
      if (headCell.wrap) {
        return (
          <Typography
            variant="body2"
            sx={{
              maxWidth: headCell.cellMaxWidth || defaultMaxWidth,
              whiteSpace: 'normal',
            }}
          >
            {contentString}
          </Typography>
        );
      }
    }

    switch (headCell.id) {
      case 'avatar':
        return (
          <Box className="flex items-center justify-center">
            <Avatar
              src={currentUser.profilePictureUrl || undefined}
              alt={currentUser.username}
              sx={{ width: 36, height: 36 }}
            >
              {(currentUser.username || 'U')[0]?.toUpperCase()}
            </Avatar>
          </Box>
        );
      case 'username':
        return (
          <Box>
            <Tooltip title={currentUser.username || ''}>
              <Typography variant="body2" noWrap>
                {currentUser.username}
              </Typography>
            </Tooltip>
            {/* Show email below username on small screens IF email column is hidden */}
            {!headCells.some(
              (hc) =>
                hc.id === 'email' && hc.className?.includes('md:table-cell'),
            ) && (
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: { xs: 'block', md: 'none' } }}
                noWrap
              >
                {currentUser.email}
              </Typography>
            )}
          </Box>
        );
      case 'email':
        return (
          <Tooltip title={currentUser.email || ''}>
            <Typography variant="body2" noWrap>
              {currentUser.email}
            </Typography>
          </Tooltip>
        );
      case 'fullName':
        return currentUser.fullName ? (
          <Typography variant="body2" noWrap>
            {currentUser.fullName}
          </Typography>
        ) : (
          <Typography variant="caption" color="textSecondary">
            N/A
          </Typography>
        );
      case 'roles':
        return (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              justifyContent:
                headCell.align === 'center' ? 'center' : 'flex-start',
            }}
          >
            {currentUser.roles && currentUser.roles.length > 0 ? (
              <Chip
                label={getPrimaryRole(currentUser.roles).toLowerCase()}
                size="small"
                color={
                  getPrimaryRole(currentUser.roles) === 'ADMIN'
                    ? 'secondary'
                    : 'default'
                }
                variant="outlined"
                sx={{
                  textTransform: 'capitalize',
                }}
              />
            ) : (
              <Typography variant="caption" color="textSecondary">
                N/A
              </Typography>
            )}
          </Box>
        );
      case 'status': {
        const { color, label } = getStatusChipProps(currentUser.status);
        return (
          <Chip
            label={label}
            size="small"
            color={color}
            variant="outlined"
            sx={{
              textTransform: 'capitalize',
            }}
          />
        );
      }
      case 'currentPlan': {
        const { style: planChipStyle, variant: planChipVariant } =
          getPlanTierStyling(currentUser, theme);
        return (
          <Chip
            label={currentUser.currentPlan || 'N/A'}
            size="small"
            variant={planChipVariant}
            sx={planChipStyle}
          />
        );
      }
      case 'actions':
        return (
          <IconButton
            size="small"
            onClick={(e) => {
              onMenuOpen(e, currentUser);
            }}
            aria-label={`actions for ${currentUser.username}`}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        );
      default:
        if (contentString === '') {
          return (
            <Typography variant="caption" color="textSecondary">
              N/A
            </Typography>
          );
        }
        // Default to simple string for other unhandled cases, possibly with a generic truncation
        if (contentString.length > 30 && !headCell.wrap) {
          // Generic truncation for long unconfigured strings
          return (
            <Tooltip title={contentString} placement="bottom-start">
              <Typography variant="body2" noWrap sx={{ maxWidth: '200px' }}>
                {contentString}
              </Typography>
            </Tooltip>
          );
        }
        return contentString;
    }
  };

  return (
    <TableRow
      hover
      selected={isSelected}
      className="group"
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={-1}
    >
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isSelected}
          onChange={(event) => onCheckboxClick(event, user.id)}
          inputProps={{ 'aria-labelledby': `user-table-checkbox-${user.id}` }}
        />
      </TableCell>

      {headCells.map((headCell) => (
        <TableCell
          key={headCell.id}
          align={headCell.align || (headCell.numeric ? 'right' : 'left')}
          sx={{
            minWidth: headCell.minWidth,

            display: headCell.className?.includes('md:table-cell')
              ? { xs: 'none', md: 'table-cell' }
              : headCell.className?.includes('xs:table-cell')
                ? { xs: 'table-cell', md: 'none' }
                : undefined,

            ...((headCell.id === 'avatar' ||
              headCell.id === 'actions' ||
              headCell.id === 'currentPlan' ||
              headCell.id === 'roles') &&
            headCell.align === 'center'
              ? { textAlign: 'center' }
              : {}),
          }}
          component={headCell.id === 'username' ? 'th' : 'td'}
          scope={headCell.id === 'username' ? 'row' : undefined}
          id={
            headCell.id === 'username'
              ? `user-table-checkbox-${user.id}`
              : undefined
          }
        >
          {getCellContent(headCell, user)}
        </TableCell>
      ))}
    </TableRow>
  );
};
