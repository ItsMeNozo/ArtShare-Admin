import React, { useRef, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Alert,
  Paper,
  Chip,
} from '@mui/material';
import {
  PhotoCameraOutlined as CameraIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { FormikProps } from 'formik';
import { CategoryFormData } from '../hooks/useCategoryForm';

interface CategoryImageManagerProps {
  formik: FormikProps<CategoryFormData>;
  isEditing: boolean;
}

const MAX_IMAGES = 4;

export const CategoryImageManager: React.FC<CategoryImageManagerProps> = ({
  formik,
  isEditing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      const currentImages = formik.values.example_images;
      const availableSlots = MAX_IMAGES - currentImages.length;

      if (files.length > availableSlots) {
        formik.setFieldError(
          'example_images',
          `You can only add ${availableSlots} more image(s). Maximum ${MAX_IMAGES} images allowed.`,
        );
        return;
      }

      const newImageUrls: string[] = [];
      let hasError = false;

      for (const file of files) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          formik.setFieldError(
            'example_images',
            `Image "${file.name}" is too large. Max size is 5MB.`,
          );
          hasError = true;
          break;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          formik.setFieldError(
            'example_images',
            `"${file.name}" is not a valid image file.`,
          );
          hasError = true;
          break;
        }

        // Create a temporary URL for the image
        const newImageUrl = URL.createObjectURL(file);
        newImageUrls.push(newImageUrl);
      }

      if (!hasError) {
        formik.setFieldValue('example_images', [
          ...currentImages,
          ...newImageUrls,
        ]);

        // Clear any previous errors
        if (formik.errors.example_images) {
          formik.setFieldError('example_images', undefined);
        }
      }
    }
    // Reset file input
    event.target.value = '';
  };

  const handleImageRemove = (indexToRemove: number) => {
    const imageToRemove = formik.values.example_images[indexToRemove];

    // Revoke the object URL to prevent memory leaks
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
    }

    const updatedImages = formik.values.example_images.filter(
      (_, index) => index !== indexToRemove,
    );
    formik.setFieldValue('example_images', updatedImages);
  };

  const triggerImageUpload = () => fileInputRef.current?.click();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isEditing) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const event = {
        target: { files: imageFiles, value: '' },
      } as any;
      handleImageAdd(event);
    }
  };

  return (
    <Grid size={{ xs: 12 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example Images
          <Chip
            label={`${formik.values.example_images.length}/${MAX_IMAGES}`}
            size="small"
            sx={{ ml: 1 }}
            color={
              formik.values.example_images.length > 0 ? 'primary' : 'default'
            }
          />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add up to {MAX_IMAGES} example images to help users understand this
          category. You can select multiple images at once.
          <br />
          Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Image Upload Area */}
        {isEditing && formik.values.example_images.length < MAX_IMAGES && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              },
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerImageUpload}
          >
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Drop images here or click to browse
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CameraIcon />}
              onClick={triggerImageUpload}
              sx={{ mt: 1 }}
            >
              Choose Images
            </Button>
          </Paper>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleImageAdd}
          style={{ display: 'none' }}
        />

        {/* Display Current Images */}
        {formik.values.example_images.length > 0 ? (
          <Grid container spacing={2}>
            {formik.values.example_images.map((imageUrl, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      '& .delete-button': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <Avatar
                    src={imageUrl}
                    variant="rounded"
                    sx={{
                      width: '100%',
                      height: 120,
                      '& img': {
                        objectFit: 'cover',
                      },
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                  {isEditing && (
                    <IconButton
                      size="small"
                      className="delete-button"
                      onClick={() => handleImageRemove(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        '&:hover': {
                          bgcolor: 'error.main',
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      p: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      align="center"
                      display="block"
                    >
                      Image {index + 1}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          !isEditing && (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: 'center',
                borderStyle: 'dashed',
                borderColor: 'grey.300',
              }}
            >
              <ImageIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
              />
              <Typography variant="body1" color="text.secondary">
                No example images added
              </Typography>
            </Paper>
          )
        )}

        {/* Error Message */}
        {formik.touched.example_images && formik.errors.example_images && (
          <Alert severity="error">{formik.errors.example_images}</Alert>
        )}

        {/* Usage Hint */}
        {isEditing && formik.values.example_images.length > 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> These images will help users understand what
              content belongs in this category. Choose representative examples
              that clearly demonstrate the category's purpose.
            </Typography>
          </Alert>
        )}
      </Box>
    </Grid>
  );
};
