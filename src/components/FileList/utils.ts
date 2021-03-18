import { FileInfo as File } from '@cognite/sdk';

export const PREVIEWABLE_FILE_TYPES = ['png', 'jpeg', 'jpg', 'svg', 'pdf'];

export const isFileOfType = (file?: File, type?: string[]) => {
  const { mimeType = '', name = '' } = file || {};
  const query = mimeType + name.substr(name.lastIndexOf('.'));
  return (type || []).some((el) => query.includes(el));
};

export const isFilePreviewable = (file?: File) =>
  isFileOfType(file, PREVIEWABLE_FILE_TYPES);
