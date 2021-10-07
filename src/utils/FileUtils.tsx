import mime from 'mime-types';
import { FileInfo } from '@cognite/sdk';
import lowerCase from 'lodash/lowerCase';

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const PREVIEWABLE_FILE_TYPES = [
  'png',
  'jpeg',
  'jpg',
  'svg',
  'webp',
  'pdf',
];

export const readablePreviewableFileTypes = () =>
  PREVIEWABLE_FILE_TYPES.reduce((acc, current, i) => {
    const fileType = current.toUpperCase();
    if (i === 0) {
      return `${fileType}`;
    }
    if (i !== PREVIEWABLE_FILE_TYPES.length - 1) {
      return `${acc}, ${fileType}`;
    }
    return `${acc} or ${fileType}`;
  }, '');

export const isFilePreviewable = (file?: FileInfo) =>
  isFileOfType(file, PREVIEWABLE_FILE_TYPES);

export const isPreviewableImage = (file?: FileInfo) =>
  isFileOfType(file, ['png', 'jpeg', 'jpg', 'svg', 'webp']);

export const isFileOfType = (file?: FileInfo, type?: string[]) => {
  const { mimeType = '', name = '' } = file || {};
  const fileExt = name.includes('.')
    ? lowerCase(name.substring(name.lastIndexOf('.') + 1))
    : undefined;
  return (type || []).some(
    el => lowerCase(mimeType).includes(el) || fileExt === el
  );
};
