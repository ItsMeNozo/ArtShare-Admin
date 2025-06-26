import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Category,
  CategoryType,
  CategoryTypeValues,
} from '../../../types/category';
import { addCategory, updateCategory } from '../categoryAPI';

export interface CategoryFormData {
  name: string;
  description: string;
  type: CategoryType;
  example_images: string[];
}

interface UseCategoryFormProps {
  initialCategory: Category | null;
  isCreatingNewCategory: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const getInitialFormData = (
  category: Category | null,
  isCreating: boolean,
): CategoryFormData => {
  if (isCreating || !category) {
    return {
      name: '',
      description: '',
      type: CategoryTypeValues.ATTRIBUTE,
      example_images: [],
    };
  }

  return {
    name: category.name,
    description: category.description || '',
    type: category.type,
    example_images: [...(category.example_images || [])],
  };
};

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name cannot exceed 100 characters')
    .required('Category name is required')
    .test('no-only-spaces', 'Category name cannot be only spaces', (value) =>
      value ? value.trim().length > 0 : false,
    ),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .required('Description is required')
    .test('no-only-spaces', 'Description cannot be only spaces', (value) =>
      value ? value.trim().length > 0 : false,
    ),
  type: Yup.string()
    .oneOf(
      Object.values(CategoryTypeValues),
      'Please select a valid category type',
    )
    .required('Category type is required'),
  example_images: Yup.array()
    .of(Yup.string().url('Invalid image URL'))
    .max(4, 'Maximum 4 example images allowed')
    .nullable(),
});

const getErrorMessage = (error: any): string => {
  // Handle API response errors
  if (error?.response?.data?.message) {
    const message = error.response.data.message;
    return Array.isArray(message) ? message.join(', ') : message;
  }

  // Handle network errors
  if (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error')
  ) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Handle standard errors
  if (error?.message) {
    return error.message;
  }

  // Fallback error message
  return 'An unexpected error occurred. Please try again later.';
};

export const useCategoryForm = ({
  initialCategory,
  isCreatingNewCategory,
  onSuccess,
  onError,
}: UseCategoryFormProps) => {
  const executeCreateCategory = async (values: CategoryFormData) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      type: values.type,
      example_images: values.example_images.filter((img) => img.trim() !== ''),
    };

    await addCategory(payload);
    return payload;
  };

  const executeUpdateCategory = async (values: CategoryFormData) => {
    if (!initialCategory?.id) {
      throw new Error('Cannot update category: Category ID is missing.');
    }

    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      type: values.type,
      example_images: values.example_images.filter((img) => img.trim() !== ''),
    };

    await updateCategory(initialCategory.id, payload);
    return payload;
  };

  const handleFormSubmit = async (values: CategoryFormData) => {
    try {
      if (isCreatingNewCategory) {
        await executeCreateCategory(values);
        onSuccess('Category created successfully!');
      } else {
        await executeUpdateCategory(values);
        onSuccess('Category updated successfully!');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      onError(
        `Failed to ${isCreatingNewCategory ? 'create' : 'update'} category: ${errorMessage}`,
      );
    }
  };

  const formik = useFormik<CategoryFormData>({
    initialValues: getInitialFormData(initialCategory, isCreatingNewCategory),
    validationSchema,
    onSubmit: handleFormSubmit,
    enableReinitialize: true,
  });

  return formik;
};
