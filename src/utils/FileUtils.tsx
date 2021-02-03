import mime from 'mime-types';
import { FileInfo } from '@cognite/sdk';

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const PREVIEWABLE_FILE_TYPES = ['png', 'jpeg', 'jpg', 'svg', 'pdf'];

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
  isFileOfType(file, ['png', 'jpeg', 'jpg', 'svg']);

export const isFileOfType = (file?: FileInfo, type?: string[]) => {
  const { mimeType = '', name = '' } = file || {};
  const query = mimeType + name.substr(name.lastIndexOf('.'));
  return (type || []).some(el => query.includes(el));
};
