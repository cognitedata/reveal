import mime from 'mime-types';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import lowerCase from 'lodash/lowerCase';

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const PREVIEWABLE_IMAGE_TYPES = ['png', 'jpeg', 'jpg', 'svg', 'webp'];
export const PREVIEWABLE_FILE_TYPES = [...PREVIEWABLE_IMAGE_TYPES, 'pdf'];

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
  isFileOfType(file, PREVIEWABLE_IMAGE_TYPES);

export const isFileOfType = (file?: FileInfo, type?: string[]) => {
  const { mimeType = '', name = '' } = file || {};
  const fileExt = name.includes('.')
    ? lowerCase(name.substring(name.lastIndexOf('.') + 1))
    : undefined;
  return (type || []).some(
    el => lowerCase(mimeType).includes(el) || fileExt === el
  );
};

export async function fetchFilePreviewURL(sdk: CogniteClient, file: FileInfo) {
  if (!isFilePreviewable(file)) return undefined;

  // Handle image url
  if (isPreviewableImage(file)) {
    const urls = await sdk.files.getDownloadUrls([{ id: file.id }]);
    const imageUrl = urls[0].downloadUrl;
    return imageUrl;
  }

  // Handle PDF first page as image url
  // TODO: Might need to update this when the new SDK is in place
  const request = await sdk.get(
    `/api/v1/projects/${sdk.project}/documents/${file.id}/preview/image/pages/1`,
    { headers: { Accept: 'image/png' }, responseType: 'arraybuffer' }
  );
  const icon = request.data;
  const arrayBufferView = new Uint8Array(icon);
  const blob = new Blob([arrayBufferView]);
  const objectURL = URL.createObjectURL(blob);
  return objectURL;
}
