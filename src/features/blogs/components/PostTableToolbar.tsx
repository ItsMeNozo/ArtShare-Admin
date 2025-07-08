import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Menu,
  MenuItem,
  useTheme,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  UndoOutlined as UndoOutlinedIcon,
  MoreVertOutlined as MoreVertOutlinedIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { CSVLink } from 'react-csv';

export interface PostTableToolbarProps {
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedPostsCount: number;
  onBulkDelete: () => void;
  onDeselectAll: () => void;
  onExportPDF: () => void;
  csvFormattedData: Array<Record<string, any>>;
  title?: string;
  isActionLoading?: boolean;
}

const PostTableToolbar: React.FC<PostTableToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedPostsCount,
  onBulkDelete,
  onDeselectAll,
  onExportPDF,
  csvFormattedData,
  title,
  isActionLoading,
}) => {
  const theme = useTheme();
  const [moreAnchor, setMoreAnchor] = React.useState<null | HTMLElement>(null);

  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreAnchor(null);
  };

  const csvHeaders = [
    { label: 'ID', key: 'ID' },
    { label: 'Title', key: 'Title' },
    { label: 'Author', key: 'Author' },
    { label: 'Created At', key: 'CreatedAt' },
  ];

  const numSelected = selectedPostsCount;

  return (
    <>
      {/* Top section: Title (optional) on left, Search Bar and other primary actions on right */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: numSelected > 0 ? 2 : 3,
          px: { xs: 1, sm: 0 },
        }}
      >
        {/* Left side: Optional Title or a spacer */}
        {title ? (
          <Typography variant="h6" component="div" sx={{}}>
            {title} {/* Actually render the title text */}
          </Typography>
        ) : (
          <Box sx={{ flexGrow: 1 }} />
        )}

        {/* Right side: Search Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={onSearchChange}
            sx={{
              minWidth: { xs: '100%', sm: 200, md: 250 },
              maxWidth: { sm: 400 },
              backgroundColor:
                theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.9rem',
                '& fieldset': {
                  borderColor:
                    theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: 'text.secondary' }}
                  />
                </InputAdornment>
              ),
            }}
          />
          {/* Example: Add New Post Button could go here */}
          {/* <Button variant="contained" startIcon={<AddIcon />}>Add Post</Button> */}
        </Box>
      </Box>

      {/* Conditional section: Appears when posts are selected */}
      {numSelected > 0 && (
        <Box
          sx={{
            mb: 2.5,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: theme.palette.action.selected,

            color: theme.palette.getContrastText(theme.palette.action.selected),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium">
            {numSelected} post(s) selected
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            alignItems="center"
            useFlexGap
            gap={1}
          >
            <Button
              startIcon={
                isActionLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DeleteIcon />
                )
              }
              color="error"
              variant="contained"
              onClick={onBulkDelete}
              size="small"
              sx={{ textTransform: 'none' }}
              disabled={isActionLoading}
            >
              Delete Selected
            </Button>
            <Button
              onClick={onDeselectAll}
              startIcon={<UndoOutlinedIcon />}
              variant="outlined"
              size="small"
              sx={{
                textTransform: 'none',

                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
              disabled={isActionLoading}
            >
              Deselect all
            </Button>
            <IconButton
              onClick={handleMoreMenuOpen}
              size="small"
              sx={{ color: 'inherit' }}
              aria-controls={Boolean(moreAnchor) ? 'export-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(moreAnchor) ? 'true' : undefined}
              aria-label="More actions including export"
              disabled={isActionLoading}
            >
              <MoreVertOutlinedIcon />
            </IconButton>
            <Menu
              id="export-menu"
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={handleMoreMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              MenuListProps={{ 'aria-labelledby': 'export-button' }}
            >
              <MenuItem
                onClick={() => {
                  handleMoreMenuClose();
                }}
              >
                <CSVLink
                  data={csvFormattedData}
                  headers={csvHeaders}
                  filename="admin-posts.csv"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  target="_blank"
                >
                  <FileDownloadOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Export CSV
                </CSVLink>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onExportPDF();
                  handleMoreMenuClose();
                }}
                disabled={isActionLoading}
              >
                <FileDownloadOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
                Export PDF
              </MenuItem>
            </Menu>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default PostTableToolbar;
