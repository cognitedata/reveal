import mime from 'mime-types';
import { FileInfo } from '@cognite/sdk';

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const isFilePreviewable = (file?: FileInfo) =>
  isFileOfType(file, ['png', 'jpeg', 'jpg', 'svg', 'pdf']);

export const isPreviewableImage = (file?: FileInfo) =>
  isFileOfType(file, ['png', 'jpeg', 'jpg', 'svg']);

export const isFileOfType = (file?: FileInfo, type?: string[]) => {
  const { mimeType = '', name = '' } = file || {};
  const query = mimeType + name.substr(name.lastIndexOf('.'));
  return (type || []).some(el => query.includes(el));
};
