import React from "react";
import {
  TextField,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  FormHelperText,
  Grid,
  Box,
  Chip,
} from "@mui/material";
import { FormikProps } from "formik";
import { CategoryFormData } from "../hooks/useCategoryForm";
import { CategoryTypeValues } from "../../../types/category";

interface FormFieldProps {
  formik: FormikProps<CategoryFormData>;
  isEditing: boolean;
}

const categoryTypeTooltips = {
  [CategoryTypeValues.ATTRIBUTE]:
    "Attribute: Describes characteristics or properties. Used for filtering or defining features (e.g., 'Color', 'Size', 'Style').",
  [CategoryTypeValues.MEDIUM]:
    "Medium: Refers to the art medium or material used. Helps classify artworks by their physical composition (e.g., 'Oil Painting', 'Sculpture', 'Digital Art').",
};

const getCategoryTypeColor = (type: string): "primary" | "secondary" => {
  return type === CategoryTypeValues.ATTRIBUTE ? "primary" : "secondary";
};

const FormTextField: React.FC<{
  formik: FormikProps<CategoryFormData>;
  id: keyof CategoryFormData;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
}> = ({
  formik,
  id,
  label,
  placeholder,
  multiline = false,
  rows = 1,
  required = false,
  disabled = false,
}) => (
  <Grid size={{ xs: 12 }}>
    <Typography
      variant="caption"
      component="label"
      htmlFor={id}
      sx={{
        display: "block",
        color: "text.secondary",
        fontWeight: 500,
        mb: 0.5,
      }}
    >
      {label} {required && <span style={{ color: "red" }}>*</span>}
    </Typography>
    <TextField
      fullWidth
      id={id}
      name={id}
      placeholder={placeholder}
      value={formik.values[id] as string}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={formik.touched[id] && Boolean(formik.errors[id])}
      helperText={formik.touched[id] && formik.errors[id]}
      multiline={multiline}
      rows={multiline ? rows : 1}
      disabled={disabled}
      variant="outlined"
      size="small"
    />
  </Grid>
);

const ReadOnlyField: React.FC<{
  label: string;
  value: string | React.ReactNode;
}> = ({ label, value }) => (
  <Grid size={{ xs: 12 }}>
    <Typography variant="caption" color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
    <Box
      component="div"
      sx={{
        fontSize: "1rem",
        fontFamily: "inherit",
        lineHeight: 1.5,
        color: "text.primary",
        minHeight: "24px",
        wordBreak: "break-words",
      }}
    >
      {value || "-"}
    </Box>
  </Grid>
);

export const CategoryNameField: React.FC<FormFieldProps> = ({
  formik,
  isEditing,
}) => {
  return isEditing ? (
    <FormTextField
      formik={formik}
      id="name"
      label="Category Name"
      placeholder="Enter a descriptive name for the category"
      required
      disabled={!isEditing}
    />
  ) : (
    <ReadOnlyField label="Category Name" value={formik.values.name} />
  );
};

export const CategoryDescriptionField: React.FC<FormFieldProps> = ({
  formik,
  isEditing,
}) => {
  return isEditing ? (
    <FormTextField
      formik={formik}
      id="description"
      label="Description"
      placeholder="Provide a detailed description of what this category represents"
      multiline
      rows={3}
      required
      disabled={!isEditing}
    />
  ) : (
    <ReadOnlyField label="Description" value={formik.values.description} />
  );
};

export const CategoryTypeField: React.FC<FormFieldProps> = ({
  formik,
  isEditing,
}) => {
  if (!isEditing) {
    return (
      <ReadOnlyField
        label="Category Type"
        value={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={categoryTypeTooltips[formik.values.type]} arrow>
              <Chip
                label={formik.values.type}
                color={getCategoryTypeColor(formik.values.type)}
                variant="outlined"
                size="small"
              />
            </Tooltip>
          </Box>
        }
      />
    );
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Typography
        variant="caption"
        component="label"
        sx={{
          display: "block",
          color: "text.secondary",
          fontWeight: 500,
          mb: 1.5,
        }}
      >
        Category Type <span style={{ color: "red" }}>*</span>
      </Typography>
      <FormControl
        fullWidth
        error={formik.touched.type && Boolean(formik.errors.type)}
        disabled={!isEditing}
        size="small"
      >
        <Select
          name="type"
          value={formik.values.type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography variant="body2" color="text.disabled">
                  Select category type
                </Typography>
              );
            }
            return selected;
          }}
        >
          {Object.values(CategoryTypeValues).map((type) => (
            <MenuItem key={type} value={type}>
              <Tooltip
                title={categoryTypeTooltips[type]}
                arrow
                placement="right"
              >
                <span>{type}</span>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
        {formik.touched.type && formik.errors.type && (
          <FormHelperText>{formik.errors.type}</FormHelperText>
        )}
      </FormControl>
    </Grid>
  );
};
