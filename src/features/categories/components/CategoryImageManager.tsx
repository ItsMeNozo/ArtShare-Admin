import React, { useRef, ChangeEvent, useState } from 'react';
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
  CircularProgress,
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
const MAX_IMAGE_WIDTH = 800; // Maximum width for compressed images
const MAX_IMAGE_HEIGHT = 600; // Maximum height for compressed images
const JPEG_QUALITY = 0.8; // JPEG compression quality (0.1 to 1.0)

// Helper function to compress image
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
        const aspectRatio = width / height;

        if (width > height) {
          width = MAX_IMAGE_WIDTH;
          height = width / aspectRatio;
        } else {
          height = MAX_IMAGE_HEIGHT;
          width = height * aspectRatio;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve(compressedDataUrl);
    };

    img.onerror = () =>
      reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};

export const CategoryImageManager: React.FC<CategoryImageManagerProps> = ({
  formik,
  isEditing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

      // Process files individually and collect results
      const processFiles = async () => {
        setIsProcessing(true);
        const validImages: string[] = [];
        const errors: string[] = [];

        for (const file of files) {
          try {
            // Validate file size (max 5MB per file)
            if (file.size > 5 * 1024 * 1024) {
              errors.push(
                `"${file.name}" is too large (${Math.round(file.size / (1024 * 1024))}MB). Max size is 5MB per image.`,
              );
              continue;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
              errors.push(`"${file.name}" is not a valid image file.`);
              continue;
            }

            // Convert to compressed base64
            const base64Image = await compressImage(file);

            validImages.push(base64Image);
          } catch (error) {
            errors.push(
              `Failed to process "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }

        // Update form with valid images
        if (validImages.length > 0) {
          formik.setFieldValue('example_images', [
            ...currentImages,
            ...validImages,
          ]);
        }

        // Show errors if any, but don't prevent valid images from being added
        if (errors.length > 0) {
          formik.setFieldError('example_images', errors.join('. '));
        } else if (formik.errors.example_images) {
          // Clear errors if all files were processed successfully
          formik.setFieldError('example_images', undefined);
        }

        setIsProcessing(false);
      };

      processFiles();
    }
    // Reset file input
    event.target.value = '';
  };

  const handleImageRemove = (indexToRemove: number) => {
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
      // Create a synthetic event to reuse the handleImageAdd logic
      const syntheticEvent = {
        target: { files: imageFiles, value: '' },
      } as unknown as ChangeEvent<HTMLInputElement>;
      handleImageAdd(syntheticEvent);
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
              cursor: isProcessing ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': !isProcessing
                ? {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                  }
                : {},
              opacity: isProcessing ? 0.7 : 1,
            }}
            onDragOver={!isProcessing ? handleDragOver : undefined}
            onDrop={!isProcessing ? handleDrop : undefined}
            onClick={!isProcessing ? triggerImageUpload : undefined}
          >
            {isProcessing ? (
              <>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Processing images...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Compressing and uploading your images
                </Typography>
              </>
            ) : (
              <>
                <UploadIcon
                  sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
                />
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
              </>
            )}
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
