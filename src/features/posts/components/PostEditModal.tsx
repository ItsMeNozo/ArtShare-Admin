import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { usePostsUI } from '../context/PostsUIContext';
import { useGetCategories } from '../hooks/useCategoryQueries';
import {
  useGetAdminPostById,
  useUpdateAdminPost,
} from '../hooks/usePostQueries';
import { useUploadPostMedias } from '../hooks/useUploadPostMedias';

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
  const { handleUploadImageFile } = useUploadPostMedias();

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      categoryIds: [] as number[],
      thumbnail: null as File | null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().nullable(),
      categoryIds: Yup.array().of(Yup.number()),
      thumbnail: Yup.mixed<File>().nullable(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      try {
        const newThumbnailUrl = await (values.thumbnail
          ? handleUploadImageFile(values.thumbnail, 'admin_thumbnail')
          : Promise.resolve(undefined));

        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('categoryIds', JSON.stringify(values.categoryIds));

        if (newThumbnailUrl) {
          formData.append('thumbnailUrl', newThumbnailUrl);
        }

        updatePostMutation.mutate(
          { id: editingPostId!, data: formData },
          {
            onSuccess: () => onPostUpdated(),
            onSettled: () => setSubmitting(false),
          },
        );
      } catch (error) {
        console.error('Failed to upload thumbnail before updating post', error);
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (post) {
      formik.setValues({
        title: post.title || '',
        description: post.description || '',
        categoryIds: post.categories.map((c) => c.id),
        thumbnail: null,
      });
      setThumbnailPreview(post.thumbnailUrl || post.medias?.[0]?.url || null);
    }
  }, [post]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue('thumbnail', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      formik.setFieldValue('thumbnail', null);
      setThumbnailPreview(post?.thumbnailUrl || post?.medias?.[0]?.url || null);
    }
  };

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
                    formik.touched.categoryIds &&
                    Boolean(formik.errors.categoryIds)
                  }
                >
                  <Typography
                    variant="caption"
                    component="label"
                    htmlFor="categoryIds-select"
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
                    id="categoryIds-select"
                    name="categoryIds"
                    multiple
                    value={formik.values.categoryIds}
                    onChange={(event) =>
                      formik.setFieldValue('categoryIds', event.target.value)
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
                  {formik.touched.categoryIds && formik.errors.categoryIds && (
                    <Typography variant="caption" color="error">
                      {formik.errors.categoryIds}
                    </Typography>
                  )}
                </FormControl>
                <Typography variant="caption" color="textSecondary">
                  User ID: {post.userId} | Username: {post.user.username}
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
                  Thumbnail
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 2,

                    ...(thumbnailPreview
                      ? {
                          lineHeight: 0,
                        }
                      : {
                          aspectRatio: '16/9',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }),
                  }}
                >
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Typography sx={{ color: 'text.secondary' }}>
                      No Thumbnail
                    </Typography>
                  )}
                </Paper>

                <FormControl
                  fullWidth
                  error={
                    formik.touched.thumbnail && Boolean(formik.errors.thumbnail)
                  }
                >
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={updatePostMutation.isPending}
                  >
                    Upload New Thumbnail
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {formik.touched.thumbnail && formik.errors.thumbnail && (
                    <Typography variant="caption" color="error">
                      {formik.errors.thumbnail}
                    </Typography>
                  )}
                </FormControl>
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
