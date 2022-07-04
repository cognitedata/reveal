import { FileInfo as File } from '@cognite/sdk';

export const isFileOfType = (file?: File, type?: string[]) => {
  const { mimeType = '', name = '' } = file || {};
  const query = mimeType + name.substr(name.lastIndexOf('.'));
  return (type || []).some((el) => query.includes(el));
};
