import {
  Brush as BrushIcon,
  Category as CategoryIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { Category, CategoryTypeValues } from '../../../types/category';

interface CategorySummaryProps {
  category: Category | null;
  isCreatingNewCategory: boolean;
}

export const CategorySummary: React.FC<CategorySummaryProps> = ({
  category,
  isCreatingNewCategory,
}) => {
  if (isCreatingNewCategory || !category) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          textAlign: 'center',
          bgcolor: 'grey.50',
          borderStyle: 'dashed',
        }}
      >
        <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          New Category
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details to create a new category
        </Typography>
      </Paper>
    );
  }

  const getTypeDescription = (type: string): string => {
    switch (type) {
      case CategoryTypeValues.ATTRIBUTE:
        return 'Describes artistic styles, themes, or characteristics (e.g., Abstract, Realistic, Dark)';
      case CategoryTypeValues.MEDIUM:
        return 'Describes the materials or tools used for creation (e.g., Digital Art, Oil Painting, Watercolor)';
      default:
        return 'General category classification';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case CategoryTypeValues.ATTRIBUTE:
        return <PaletteIcon />;
      case CategoryTypeValues.MEDIUM:
        return <BrushIcon />;
      default:
        return <CategoryIcon />;
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        Category Details
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            NAME
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
            {category.name}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            DESCRIPTION
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {category.description || 'No description provided'}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            TYPE
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {getTypeIcon(category.type)}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {category.type}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.8rem' }}
          >
            {getTypeDescription(category.type)}
          </Typography>
        </Grid>

        {category.id && (
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              METADATA
            </Typography>
            <Typography variant="body2">
              <strong>ID:</strong> {category.id}
            </Typography>{' '}
            {category.createdAt && (
              <Typography variant="body2">
                <strong>Created:</strong>{' '}
                {new Date(category.createdAt).toLocaleDateString()}
              </Typography>
            )}
            {category.updatedAt && (
              <Typography variant="body2">
                <strong>Last Updated:</strong>{' '}
                {new Date(category.updatedAt).toLocaleDateString()}
              </Typography>
            )}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
