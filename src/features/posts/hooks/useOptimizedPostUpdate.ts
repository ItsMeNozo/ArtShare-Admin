import { useCallback, useMemo } from 'react';

interface PostFormValues {
  title: string;
  description: string;
  categoryIds: number[];
  thumbnail: File | null;
}

interface UseOptimizedPostUpdateProps {
  currentValues: PostFormValues;
  initialValues: Omit<PostFormValues, 'thumbnail'>;
}

export const useOptimizedPostUpdate = ({
  currentValues,
  initialValues,
}: UseOptimizedPostUpdateProps) => {
  const getChangedFields = useCallback(() => {
    const changedFields: Record<string, any> = {};
    let hasChanges = false;

    // Check for text field changes
    if (currentValues.title !== initialValues.title) {
      changedFields.title = currentValues.title;
      hasChanges = true;
    }

    if (currentValues.description !== initialValues.description) {
      changedFields.description = currentValues.description || '';
      hasChanges = true;
    }

    // Check for category changes
    const initialCategoryIds = [...initialValues.categoryIds].sort();
    const currentCategoryIds = [...currentValues.categoryIds].sort();
    if (
      JSON.stringify(initialCategoryIds) !== JSON.stringify(currentCategoryIds)
    ) {
      changedFields.categoryIds = JSON.stringify(currentValues.categoryIds);
      hasChanges = true;
    }

    return {
      changedFields,
      hasChanges,
      hasImageUpload: !!currentValues.thumbnail,
    };
  }, [currentValues, initialValues]);

  const hasChanges = useMemo(() => {
    if (!initialValues.title) return false;

    return (
      currentValues.title !== initialValues.title ||
      currentValues.description !== initialValues.description ||
      JSON.stringify([...currentValues.categoryIds].sort()) !==
        JSON.stringify([...initialValues.categoryIds].sort()) ||
      currentValues.thumbnail !== null
    );
  }, [currentValues, initialValues]);

  const changedFieldsDisplay = useMemo(() => {
    if (!initialValues.title) return [];

    const changes = [];
    if (currentValues.title !== initialValues.title) changes.push('Title');
    if (currentValues.description !== initialValues.description)
      changes.push('Description');
    if (
      JSON.stringify([...currentValues.categoryIds].sort()) !==
      JSON.stringify([...initialValues.categoryIds].sort())
    )
      changes.push('Categories');
    if (currentValues.thumbnail !== null) changes.push('Thumbnail');

    return changes;
  }, [currentValues, initialValues]);

  return {
    getChangedFields,
    hasChanges,
    changedFieldsDisplay,
    isImageUpdate: !!currentValues.thumbnail,
    isTextOnlyUpdate: hasChanges && !currentValues.thumbnail,
  };
};
