import { MediaTypeOption } from 'src/modules/FilterSidePanel/types';

export enum MimeTypes {
  jpg = 'image/jpg',
  jpeg = 'image/jpeg',
  png = 'image/png',
  mp4 = 'video/mp4',
  webm = 'video/webm',
}

export const VALID_MIME_TYPES: {
  type: string;
  extension: string;
  category: MediaTypeOption;
}[] = [
  { type: MimeTypes.jpg, extension: '.jpg', category: MediaTypeOption.image },
  { type: MimeTypes.jpeg, extension: '.jpeg', category: MediaTypeOption.image },
  { type: MimeTypes.png, extension: '.png', category: MediaTypeOption.image },
  { type: MimeTypes.mp4, extension: '.mp4', category: MediaTypeOption.video },
  { type: MimeTypes.webm, extension: '.webm', category: MediaTypeOption.video },
];
