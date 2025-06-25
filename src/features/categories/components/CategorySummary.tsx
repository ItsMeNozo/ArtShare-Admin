import React from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Avatar,
  Paper,
  Badge,
} from "@mui/material";
import {
  Category as CategoryIcon,
  Image as ImageIcon,
  Palette as PaletteIcon,
  Brush as BrushIcon,
} from "@mui/icons-material";
import { Category } from "../../../types/category";
import { CategoryTypeValues } from "../../../types/category";

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
          p: 3,
          textAlign: "center",
          bgcolor: "grey.50",
          borderStyle: "dashed",
        }}
      >
        <CategoryIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          New Category
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details to create a new category
        </Typography>
      </Paper>
    );
  }

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case CategoryTypeValues.ATTRIBUTE:
        return "primary";
      case CategoryTypeValues.MEDIUM:
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, height: "fit-content" }}>
      <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
        Category Overview
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            bgcolor: `${getTypeColor(category.type)}.main`,
            fontSize: "2rem",
          }}
        >
          {getTypeIcon(category.type)}
        </Avatar>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          {category.name}
        </Typography>

        <Chip
          label={category.type}
          color={getTypeColor(category.type) as any}
          variant="outlined"
          icon={getTypeIcon(category.type)}
          sx={{ mb: 2 }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            DESCRIPTION
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {category.description || "No description provided"}
          </Typography>
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            TYPE
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getTypeIcon(category.type)}
            <Typography variant="body2">{category.type}</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            EXAMPLES
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Badge
              badgeContent={category.example_images?.length || 0}
              color="primary"
              showZero
            >
              <ImageIcon />
            </Badge>
            <Typography variant="body2">
              {category.example_images?.length || 0} images
            </Typography>
          </Box>
        </Grid>

        {category.id && (
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              METADATA
            </Typography>
            <Typography variant="body2">
              <strong>ID:</strong> {category.id}
            </Typography>{" "}
            {category.created_at && (
              <Typography variant="body2">
                <strong>Created:</strong>{" "}
                {new Date(category.created_at).toLocaleDateString()}
              </Typography>
            )}
            {category.updated_at && (
              <Typography variant="body2">
                <strong>Last Updated:</strong>{" "}
                {new Date(category.updated_at).toLocaleDateString()}
              </Typography>
            )}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
