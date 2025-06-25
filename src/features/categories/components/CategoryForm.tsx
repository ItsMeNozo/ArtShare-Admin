import React from "react";
import { Box, Typography, Grid, Divider, Paper } from "@mui/material";
import { FormikProps } from "formik";
import { CategoryFormData } from "../hooks/useCategoryForm";
import { Category } from "../../../types/category";
import {
  CategoryNameField,
  CategoryDescriptionField,
  CategoryTypeField,
} from "./CategoryFormFields";
import { CategoryImageManager } from "./CategoryImageManager";
import { CategorySummary } from "./CategorySummary";

interface CategoryFormProps {
  formik: FormikProps<CategoryFormData>;
  isEditing: boolean;
  isCreatingNewCategory: boolean;
  initialCategory?: Category | null;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  formik,
  isEditing,
  isCreatingNewCategory,
  initialCategory = null,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ borderBottom: 1, borderColor: "divider", pb: 1, mb: 3 }}
      >
        {isCreatingNewCategory ? "Create New Category" : "Category Details"}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Category Summary - Only show for existing categories */}
          {!isCreatingNewCategory && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <CategorySummary
                category={initialCategory}
                isCreatingNewCategory={isCreatingNewCategory}
              />
            </Grid>
          )}

          {/* Basic Information Section */}
          <Grid size={{ xs: 12, lg: isCreatingNewCategory ? 8 : 8 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, height: "fit-content", mb: 3 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main" }}
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

            {/* Example Images Section */}
            <Paper variant="outlined" sx={{ p: 3, height: "fit-content" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main" }}
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
