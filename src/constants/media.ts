export const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];
