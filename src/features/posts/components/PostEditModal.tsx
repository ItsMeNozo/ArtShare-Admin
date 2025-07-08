import React, { useEffect, useMemo } from 'react';
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
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { usePostsUI } from '../context/PostsUIContext';
import {
  useGetAdminPostById,
  useUpdateAdminPost,
} from '../hooks/usePostQueries';
import { useGetCategories } from '../hooks/useCategoryQueries';

interface AdminPostEditModalProps {
  onPostUpdated: () => void;
}

const StyledFormField: React.FC<{
  id: string;
  label: string;
  value: string | number | undefined;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur: (event: React.FocusEvent<any>) => void;
  error?: boolean;
  helperText?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}> = ({ id, label, value, onChange, onBlur, error, helperText, ...props }) => (
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
        name={id}
        id={id}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
        {...props}
        size="small"
      />
    </Grid>
  </Grid>
);

export const AdminPostEditModal: React.FC<AdminPostEditModalProps> = ({
  onPostUpdated,
}) => {
  const { editingPostId, closeEditModal } = usePostsUI();
  const {
    data: post,
    isLoading: isPostLoading,
    error: fetchError,
  } = useGetAdminPostById(editingPostId!);
  const {
    data: categories = [],
    isLoading: areCategoriesLoading,
    error: categoriesError,
  } = useGetCategories();
  const updatePostMutation = useUpdateAdminPost();

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      cate_ids: [] as number[],
      thumbnail_url: null as string | null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().nullable(),
      cate_ids: Yup.array().of(Yup.number()),
      thumbnail_url: Yup.string().nullable(),
    }),
    onSubmit: (values) => {
      updatePostMutation.mutate(
        { id: editingPostId!, data: values },
        {
          onSuccess: () => onPostUpdated(),
        },
      );
    },
  });

  useEffect(() => {
    if (post) {
      formik.setValues({
        title: post.title || '',
        description: post.description || '',
        cate_ids: post.categories.map((c) => c.id),
        thumbnail_url: post.thumbnail_url || post.medias?.[0]?.url || null,
      });
    }
  }, [post]);

  const selectedMediaIdForThumbnail = useMemo(() => {
    return (
      post?.medias.find((m) => m.url === formik.values.thumbnail_url)?.id ||
      null
    );
  }, [post?.medias, formik.values.thumbnail_url]);

  return (
    <Dialog
      open={!!editingPostId}
      onClose={closeEditModal}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Edit Post (ID: {editingPostId})</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          {isPostLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          )}
          {fetchError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >{`Failed to load post data: ${fetchError.message}`}</Alert>
          )}
          {categoriesError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >{`Failed to load categories: ${categoriesError.message}`}</Alert>
          )}
          {updatePostMutation.error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >{`Failed to save post: ${updatePostMutation.error.message}`}</Alert>
          )}

          {!isPostLoading && post && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <StyledFormField
                  id="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  required
                  disabled={updatePostMutation.isPending}
                />
                <StyledFormField
                  id="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  multiline
                  rows={5}
                  disabled={updatePostMutation.isPending}
                />
                <FormControl
                  fullWidth
                  sx={{ mb: 2 }}
                  error={
                    formik.touched.cate_ids && Boolean(formik.errors.cate_ids)
                  }
                >
                  <Typography
                    variant="caption"
                    component="label"
                    htmlFor="cate_ids-select"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      fontWeight: 500,
                      mb: 0.5,
                    }}
                  >
                    Categories
                    {areCategoriesLoading && <CircularProgress size={12} />}
                  </Typography>
                  <Select
                    labelId="categories-label-id-placeholder"
                    id="cate_ids-select"
                    name="cate_ids"
                    multiple
                    value={formik.values.cate_ids}
                    onChange={(event) =>
                      formik.setFieldValue('cate_ids', event.target.value)
                    }
                    input={<OutlinedInput size="small" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((id) => (
                          <Chip
                            key={id}
                            label={
                              categories.find((c) => c.id === id)?.name ||
                              `ID: ${id}`
                            }
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    disabled={
                      updatePostMutation.isPending || areCategoriesLoading
                    }
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.cate_ids && formik.errors.cate_ids && (
                    <Typography variant="caption" color="error">
                      {formik.errors.cate_ids}
                    </Typography>
                  )}
                </FormControl>
                <Typography variant="caption" color="textSecondary">
                  User ID: {post.user_id} | Username: {post.user.username}
                </Typography>
              </Grid>

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
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  {formik.values.thumbnail_url ? (
                    <img
                      src={formik.values.thumbnail_url}
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
                {post.medias && post.medias.length > 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      overflowX: 'auto',
                      py: 1,
                      gap: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    {post.medias.map((media) => (
                      <Card
                        key={media.id}
                        onClick={() =>
                          formik.setFieldValue('thumbnail_url', media.url)
                        }
                        sx={{
                          minWidth: 100,
                          maxWidth: 100,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor:
                            selectedMediaIdForThumbnail === media.id
                              ? 'primary.main'
                              : 'transparent',
                          transition: 'border-color 0.2s',
                        }}
                      >
                        <CardActionArea>
                          <CardMedia
                            component="img"
                            height="80"
                            image={media.url}
                            alt={`Media ${media.id}`}
                            sx={{ objectFit: 'cover' }}
                          />
                        </CardActionArea>
                      </Card>
                    ))}
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
          <Button
            onClick={closeEditModal}
            color="inherit"
            disabled={updatePostMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={updatePostMutation.isPending || isPostLoading}
          >
            {updatePostMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminPostEditModal;
