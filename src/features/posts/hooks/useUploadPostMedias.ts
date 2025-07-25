import { nanoid } from 'nanoid';
import {
  getPresignedUrl,
  GetPresignedUrlResponse,
  uploadFile,
} from '../../../api/storage';
import { useSnackbar } from '../../../hooks/useSnackbar';
const POSTS_STORAGE_DIRECTORY = 'posts';

export function useUploadPostMedias() {
  const { showSnackbar } = useSnackbar();

  const handleUploadImageFile = async (
    imageFile: File,
    filenNamePrefix: string,
  ): Promise<string> => {
    try {
      const presigned: GetPresignedUrlResponse = await getPresignedUrl(
        `${filenNamePrefix}_${nanoid(6)}`,
        imageFile.type.split('/')[1],
        'image',
        POSTS_STORAGE_DIRECTORY,
      );
      await uploadFile(imageFile, presigned.presignedUrl);
      return presigned.fileUrl;
    } catch (error) {
      showSnackbar('Failed to upload image', 'error');
      throw error;
    }
  };

  return {
    handleUploadImageFile,
  };
}
