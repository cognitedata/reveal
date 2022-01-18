import { MediaTypeOption } from 'src/modules/FilterSidePanel/types';

export const VALID_MIME_TYPES: {
  type: string;
  extension: string;
  category: MediaTypeOption;
}[] = [
  { type: 'image/jpg', extension: '.jpg', category: MediaTypeOption.image },
  { type: 'image/jpeg', extension: '.jpeg', category: MediaTypeOption.image },
  { type: 'image/png', extension: '.png', category: MediaTypeOption.image },
  { type: 'video/mp4', extension: '.mp4', category: MediaTypeOption.video },
  { type: 'video/webm', extension: '.webm', category: MediaTypeOption.video },
];
