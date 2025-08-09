import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { useSnackbar } from '../../../hooks/useSnackbar';
import { usePostsUI } from '../context/PostsUIContext';
import { useGetCategories } from '../hooks/useCategoryQueries';
import { useOptimizedPostUpdate } from '../hooks/useOptimizedPostUpdate';
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
    refetch: refetchPost,
  } = useGetAdminPostById(editingPostId!);
  const {
    data: categories = [],
    isLoading: areCategoriesLoading,
    error: categoriesError,
  } = useGetCategories();
  const updatePostMutation = useUpdateAdminPost();
  const { handleUploadImageFile } = useUploadPostMedias();
  const { showSnackbar } = useSnackbar();

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    categoryIds: [] as number[],
  });

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
      setSubmitting(true); // Show loading immediately

      try {
        const {
          changedFields,
          hasChanges: fieldsHaveChanges,
          hasImageUpload,
        } = getChangedFields();

        if (!fieldsHaveChanges && !values.thumbnail) {
          setSubmitting(false);
          closeEditModal();
          return;
        }

        // Upload thumbnail if needed (this is done while loading is already shown)
        let newThumbnailUrl: string | undefined;
        if (values.thumbnail) {
          newThumbnailUrl = await handleUploadImageFile(
            values.thumbnail,
            'admin_thumbnail',
          );
          changedFields.thumbnailUrl = newThumbnailUrl;
        }

        // Use JSON for simple field updates, FormData only if absolutely necessary
        const shouldUseFormData = hasImageUpload || !!newThumbnailUrl;

        if (shouldUseFormData) {
          // Use FormData when we have file uploads
          const formData = new FormData();
          Object.entries(changedFields).forEach(([key, value]) => {
            formData.append(key, String(value));
          });

          updatePostMutation.mutate(
            { id: editingPostId!, data: formData },
            {
              onSuccess: () => {
                showSnackbar('Post updated successfully!', 'success');
                onPostUpdated();
                closeEditModal();
              },
              onError: (error) => {
                console.error('Failed to update post', error);
                showSnackbar('Failed to update post', 'error');
                setSubmitting(false);
              },
            },
          );
        } else {
          // Use JSON for faster text-only updates
          updatePostMutation.mutate(
            { id: editingPostId!, data: changedFields as any },
            {
              onSuccess: () => {
                showSnackbar('Post updated successfully!', 'success');
                onPostUpdated();
                closeEditModal();
              },
              onError: (error) => {
                console.error('Failed to update post', error);
                showSnackbar('Failed to update post', 'error');
                setSubmitting(false);
              },
            },
          );
        }
      } catch (error) {
        console.error('Failed to update post', error);
        setSubmitting(false);
      }
    },
  });

  // Use optimization hook for performance tracking
  const { hasChanges, changedFieldsDisplay, getChangedFields } =
    useOptimizedPostUpdate({
      currentValues: formik.values,
      initialValues,
    });

  // Force refetch when modal opens to get the latest data
  useEffect(() => {
    if (editingPostId) {
      refetchPost();
    }
  }, [editingPostId, refetchPost]);

  useEffect(() => {
    if (post) {
      const values = {
        title: post.title || '',
        description: post.description || '',
        categoryIds: post.categories.map((c) => c.id),
      };

      // Reset form completely with fresh data
      formik.resetForm({
        values: {
          ...values,
          thumbnail: null,
        },
      });

      setInitialValues(values);
      setThumbnailPreview(post.thumbnailUrl || post.medias?.[0]?.url || null);
    }
  }, [post, editingPostId]); // Also depend on editingPostId to reset when modal opens

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
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        Edit Post (ID: {editingPostId})
        {editingPostId && (
          <Tooltip title="View Public Post">
            <IconButton
              onClick={() => {
                const userUrl = import.meta.env.VITE_FE_USER_URL || '';
                window.open(`${userUrl}/posts/${editingPostId}`, '_blank');
              }}
              sx={{ color: 'primary.main' }}
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>
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
                        {selected
                          .filter((id) => id != null)
                          .map((id) => {
                            const category = categories.find(
                              (c) => c.id === id,
                            );
                            return (
                              <Chip
                                key={id}
                                label={category?.name || `ID: ${id}`}
                                size="small"
                              />
                            );
                          })}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 224,
                        },
                      },
                    }}
                    disabled={
                      updatePostMutation.isPending || areCategoriesLoading
                    }
                  >
                    {categories
                      .filter(
                        (category) => category && category.id && category.name,
                      )
                      .map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Checkbox
                            checked={formik.values.categoryIds.includes(
                              category.id,
                            )}
                          />
                          <ListItemText primary={category.name} />
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
          {hasChanges && (
            <Box
              sx={{
                mr: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="caption" color="warning.main">
                Unsaved changes: {changedFieldsDisplay.join(', ')}
              </Typography>
            </Box>
          )}
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
            disabled={
              updatePostMutation.isPending || isPostLoading || !hasChanges
            }
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
