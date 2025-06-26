import React from 'react';
import { Box, Typography, Grid, Divider, Paper } from '@mui/material';
import { FormikProps } from 'formik';
import { CategoryFormData } from '../hooks/useCategoryForm';
import {
  CategoryNameField,
  CategoryDescriptionField,
  CategoryTypeField,
} from './CategoryFormFields';
import { CategoryImageManager } from './CategoryImageManager';

interface CategoryFormProps {
  formik: FormikProps<CategoryFormData>;
  isEditing: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  formik,
  isEditing,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Category Information Section - Full width for both create and edit */}
          <Grid size={{ xs: 12 }}>
            {/* Basic Information Section */}
            <Paper
              variant="outlined"
              sx={{ p: 2, height: 'fit-content', mb: 3 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main' }}
              >
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <CategoryNameField formik={formik} isEditing={isEditing} />
                <CategoryDescriptionField
                  formik={formik}
                  isEditing={isEditing}
                />
                <CategoryTypeField formik={formik} isEditing={isEditing} />
              </Grid>
            </Paper>

            {/* Visual Examples Section */}
            <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main' }}
              >
                Visual Examples
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <CategoryImageManager formik={formik} isEditing={isEditing} />
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
