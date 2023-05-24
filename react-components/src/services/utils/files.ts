import { FileInfo } from '@cognite/sdk';
import lowerCase from 'lodash/lowerCase';

export const isFileOfType = (
  file?: FileInfo,
  type?: string[]
) => {
  const { mimeType = '', name = '' } = file || {};
  const fileExt = name.includes('.')
    ? lowerCase(name.substring(name.lastIndexOf('.') + 1))
    : undefined;
  return (type || []).some(
    (el) => lowerCase(mimeType).includes(el) || fileExt === el
  );
};

export const getObjectURL = (data: ArrayBuffer): string => {
  const arrayBufferView = new Uint8Array(data);
  const blob = new Blob([arrayBufferView]);
  return URL.createObjectURL(blob);
};
