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
    <Box sx={{ p: 2 }}>
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

          {/* Category Information Section */}
          <Grid size={{ xs: 12, lg: isCreatingNewCategory ? 12 : 8 }}>
            {/* Example Images Section */}
            <Paper variant="outlined" sx={{ p: 2, height: "fit-content" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "primary.main" }}
              >
                {isCreatingNewCategory
                  ? "Category Information"
                  : "Visual Examples"}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {isCreatingNewCategory && (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <CategoryNameField formik={formik} isEditing={isEditing} />
                    <CategoryDescriptionField
                      formik={formik}
                      isEditing={isEditing}
                    />
                    <CategoryTypeField formik={formik} isEditing={isEditing} />
                  </Grid>
                  <Divider sx={{ mb: 3 }} />
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ color: "primary.main" }}
                  >
                    Visual Examples
                  </Typography>
                </>
              )}

              <CategoryImageManager formik={formik} isEditing={isEditing} />
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};
