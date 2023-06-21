/*
 * Taken from data-exploration because of FileUploader
 */
import mime from 'mime-types';
import { FileInfo } from '@cognite/sdk';

export const getMIMEType = (fileURI: string) =>
  mime.lookup(fileURI) || 'application/octet-stream';

export const PREVIEWABLE_FILE_TYPES = ['png', 'jpeg', 'jpg', 'svg'];

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
  return (type || []).some((el) => query.includes(el));
};

export const isVideo = (file?: FileInfo) => isFileOfType(file, ['mp4', 'webm']);

export const renameDuplicates = (filenames: string[]) => {
  const count: any = {};
  const uniqueFilenames = [...filenames];
  filenames.forEach((filename, i) => {
    if (filenames.indexOf(filename) !== i) {
      const c =
        filename in count
          ? // eslint-disable-next-line operator-assignment
            (count[filename] = count[filename] + 1)
          : (count[filename] = 1);
      const ext = filename.includes('.')
        ? filename.substr(filename.lastIndexOf('.'))
        : '';
      const name = filename.includes('.')
        ? filename.substr(0, filename.lastIndexOf('.'))
        : filename;
      const k = ext ? `${name}(${c})${ext}` : `${name}(${c})`;

      uniqueFilenames[i] = k;
    }
  });
  return uniqueFilenames;
};
