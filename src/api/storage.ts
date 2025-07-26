import axios from 'axios';
import api from './baseApi';

export type GetPresignedUrlResponse = {
  presignedUrl: string;
  fileUrl: string;
};

export const getPresignedUrl = async (
  fileName: string,
  extension: string,
  mediaType: string,
  directory: string,
): Promise<GetPresignedUrlResponse> => {
  const response = await api.post('/storage/presigned-url', {
    fileName,
    extension,
    mediaType,
    directory,
  });
  return response.data;
};

export const uploadFile = async (file: File, presignedUrl: string) => {
  try {
    // Use the fetch API to send a PUT request to the presigned URL
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type, // Set the content type to the file's MIME type
      },
    });
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
