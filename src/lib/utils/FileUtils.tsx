import mime from 'mime-types';
import { FileInfo } from '@cognite/sdk';

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const isFilePreviewable = (file?: FileInfo) =>
  file
    ? file.mimeType === 'application/pdf' || isPreviewableImage(file)
    : false;

export const isPreviewableImage = (file: FileInfo) => {
  const { mimeType = '' } = file;
  return ['png', 'jpeg', 'jpg', 'svg'].some(el => mimeType.includes(el));
};
