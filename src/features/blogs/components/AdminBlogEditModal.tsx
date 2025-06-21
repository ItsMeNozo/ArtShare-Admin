import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Grid,
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Paper,
  Card,
  CardActionArea,
  CardMedia,
} from '@mui/material';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Art' },
  { id: 2, name: 'Photography' },
  { id: 3, name: 'Digital' },
  { id: 4, name: 'Abstract' },
  { id: 5, name: 'Nature' },
];

interface AdminPostEditModalProps {
  open: boolean;
  onClose: () => void;
  postId: number | null;
  onPostUpdated: () => void;
}

const StyledFormField: React.FC<{
  id: string;
  label: string;
  value: string | number | undefined;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}> = ({
  id,
  label,
  value,
  onChange,
  multiline,
  rows,
  required,
  disabled,
  type = 'text',
}) => (
  <Grid container direction="column" spacing={0.5} sx={{ mb: 2 }}>
    <Grid size={{ xs: 12 }}>
      <Typography
        variant="caption"
        component="label"
        htmlFor={id}
        sx={{
          display: 'block',
          color: 'text.secondary',
          fontWeight: 500,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
    </Grid>
    <Grid size={{ xs: 12 }}>
      <TextField
        fullWidth
        variant="outlined"
        type={type}
        name={id}
        id={id}
        value={value || ''}
        onChange={onChange}
        multiline={multiline}
        rows={multiline ? rows || 3 : 1}
        required={required}
        disabled={disabled}
        size="small"
      />
    </Grid>
  </Grid>
);

const AdminBlogEditModal: React.FC<AdminPostEditModalProps> = ({
  open,
  onClose,
  postId,
  onPostUpdated,
}) => {
  const [blog, setPost] = useState<PostDetailsResponseDto | null>(null);
  const [formData, setFormData] = useState<AdminUpdatePostDto>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [selectedMediaIdForThumbnail, setSelectedMediaIdForThumbnail] =
    useState<number | null>(null);
  const [currentDisplayThumbnailUrl, setCurrentDisplayThumbnailUrl] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (open && postId) {
      setLoading(true);
      setError(null);
      fetchAdminPostDetails(postId)
        .then((data) => {
          setPost(data);
          setFormData({
            title: data.title,
            description: data.description || '',
          });
          setSelectedCategoryIds(data.categories.map((c) => c.id));

          setCurrentDisplayThumbnailUrl(data.thumbnail_url);
          // Now data.medias items should have 'id' directly
          const initialSelectedMedia = data.medias.find(
            (m) => m.url === data.thumbnail_url,
          );
          if (initialSelectedMedia) {
            setSelectedMediaIdForThumbnail(initialSelectedMedia.id); // Access 'id' directly
          } else if (data.medias.length > 0) {
            // Fallback: if no URL match, select the first media's ID if available
            setSelectedMediaIdForThumbnail(data.medias[0].id);
            setCurrentDisplayThumbnailUrl(data.medias[0].url);
          } else {
            setSelectedMediaIdForThumbnail(null);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch post details:', err);
          setError('Failed to load post data.');
        })
        .finally(() => setLoading(false));
    } else {
      setPost(null);
      setFormData({});
      setSelectedCategoryIds([]);
      setSelectedMediaIdForThumbnail(null);
      setCurrentDisplayThumbnailUrl(undefined);
    }
  }, [open, postId]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target;
    const name = target.name;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: target.value }));
    }
  };

  const handleCategoryChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setSelectedCategoryIds(
      typeof value === 'string' ? value.split(',').map(Number) : value,
    );
  };

  // Parameter type is now directly the inferred type from post.medias array
  const handleThumbnailSelectionChange = (
    media: PostDetailsResponseDto['medias'][0],
  ) => {
    setSelectedMediaIdForThumbnail(media.id); // Access 'id' directly
    setCurrentDisplayThumbnailUrl(media.url);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!postId) return;
    setSaving(true);
    setError(null);
    const payload: AdminUpdatePostDto = {
      ...formData,
      cate_ids: selectedCategoryIds,
      thumbnail_url: currentDisplayThumbnailUrl,
    };
    Object.keys(payload).forEach(
      (key) =>
        payload[key as keyof AdminUpdatePostDto] === undefined &&
        delete payload[key as keyof AdminUpdatePostDto],
    );
    try {
      await adminUpdatePost(postId, payload);
      onPostUpdated();
      onClose();
    } catch (err: any) {
      console.error('Failed to update post:', err);
      setError(err.response?.data?.message || 'Failed to update post.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Post (ID: {postId})</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {!loading && post && (
            <Grid container spacing={3}>
              {/* Column 1: Form Fields */}
              <Grid size={{ xs: 12, md: 7 }}>
                <StyledFormField
                  id="title"
                  label="Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
                <StyledFormField
                  id="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={5}
                  disabled={saving}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    component="label"
                    htmlFor="categories-select"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Categories
                  </Typography>
                  <Select
                    labelId="categories-label-id-placeholder"
                    id="categories-select"
                    multiple
                    value={selectedCategoryIds}
                    onChange={handleCategoryChange}
                    input={<OutlinedInput notched={false} size="small" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as number[]).map((id) => (
                          <Chip
                            key={id}
                            label={
                              MOCK_CATEGORIES.find((c) => c.id === id)?.name ||
                              id
                            }
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    disabled={saving}
                    size="small"
                  >
                    {MOCK_CATEGORIES.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="textSecondary">
                  User ID: {post.user_id} | Username: {post.user.username}
                </Typography>
              </Grid>

              {/* Column 2: Thumbnail Preview and Selection */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Current Thumbnail
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    backgroundColor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {currentDisplayThumbnailUrl ? (
                    <img
                      src={currentDisplayThumbnailUrl}
                      alt="Selected Thumbnail"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: 'text.secondary' }}>
                      No Thumbnail Selected
                    </Typography>
                  )}
                </Paper>

                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Select from Post Media
                </Typography>
                {post.medias && post.medias.length > 0 ? ( // Check post.medias itself
                  <Box
                    sx={{
                      display: 'flex',
                      overflowX: 'auto',
                      py: 1,
                      gap: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: 'action.hover',
                    }}
                  >
                    {post.medias.map(
                      (
                        media, // TypeScript now knows media has 'id', 'url', etc.
                      ) => (
                        <Card
                          key={media.id} // Use unique media.id as key
                          onClick={() => handleThumbnailSelectionChange(media)}
                          sx={{
                            minWidth: 100,
                            maxWidth: 100,
                            cursor: 'pointer',
                            border:
                              selectedMediaIdForThumbnail === media.id
                                ? '2px solid'
                                : '2px solid transparent',
                            borderColor:
                              selectedMediaIdForThumbnail === media.id
                                ? 'primary.main'
                                : 'transparent',
                            transition: 'border-color 0.2s',
                            '&:hover': {
                              borderColor:
                                selectedMediaIdForThumbnail !== media.id
                                  ? 'grey.500'
                                  : undefined,
                            },
                          }}
                        >
                          <CardActionArea>
                            <CardMedia
                              component="img"
                              height="80"
                              image={media.url}
                              alt={media.description || `Media ${media.id}`}
                              sx={{ objectFit: 'cover' }}
                            />
                          </CardActionArea>
                        </Card>
                      ),
                    )}
                  </Box>
                ) : (
                  <Typography
                    sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 1 }}
                  >
                    No media items available in this post.
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving || loading}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminBlogEditModal;
