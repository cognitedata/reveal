import { FileInfo as File } from '@cognite/sdk';

export const PREVIEWABLE_IMAGE_TYPES = ['png', 'jpeg', 'jpg', 'svg'];
export const PREVIEWABLE_DOCUMENT_TYPES = ['pdf'];
const PREVIEWABLE_FILE_TYPES = [
  ...PREVIEWABLE_IMAGE_TYPES,
  ...PREVIEWABLE_DOCUMENT_TYPES,
];

const isFileOfType = (file?: File, type?: string[]) => {
  const { mimeType = '', name = '' } = file || {};
  const query = mimeType + name.substr(name.lastIndexOf('.'));
  return (type || []).some((el) => query.includes(el));
};

export const isFilePreviewable = (file?: File) =>
  isFileOfType(file, PREVIEWABLE_FILE_TYPES);

export const isPreviewableImage = (file: File) =>
  isFileOfType(file, PREVIEWABLE_IMAGE_TYPES);

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
