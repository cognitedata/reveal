import lowerCase from 'lodash/lowerCase';
import mime from 'mime-types';

import { CogniteClient, FileInfo } from '@cognite/sdk';
import { isSupportedFileInfo } from '@cognite/unified-file-viewer';

import { getObjectURL } from '@data-exploration-lib/core';

// import { InternalDocument } from '@data-exploration-lib/domain-layer';
type InternalDocument = any;

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const PREVIEWABLE_IMAGE_TYPES = ['png', 'jpeg', 'jpg', 'svg', 'webp'];
export const PREVIEWABLE_FILE_TYPES = [
  ...PREVIEWABLE_IMAGE_TYPES,
  'tif',
  'tiff',
  'pdf',
  'txt',
  'json',
  'csv',
];

export const isDocument = (
  item: InternalDocument | FileInfo
): item is InternalDocument => {
  return (item as InternalDocument).sourceFile !== undefined;
};

export const isFilePreviewable = (file?: FileInfo | InternalDocument) => {
  if (file === undefined) return false;

  if (isDocument(file)) {
    return isSupportedFileInfo(file.sourceFile);
  }
  return isSupportedFileInfo(file);
};

export const isPreviewableImage = (file?: FileInfo | InternalDocument) =>
  isFileOfType(file, PREVIEWABLE_IMAGE_TYPES);

export const isFileOfType = (
  file?: FileInfo | InternalDocument,
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

export async function fetchFilePreviewURL(
  sdk: CogniteClient,
  file: FileInfo | InternalDocument
) {
  if (!isFilePreviewable(file)) return undefined;

  // Handle image url
  if (isPreviewableImage(file)) {
    const urls = await sdk.files.getDownloadUrls([{ id: file.id }]);
    const imageUrl = urls[0].downloadUrl;
    return imageUrl;
  }

  return sdk.documents.preview.documentAsImage(file.id, 1).then((response) => {
    const data = response;
    return getObjectURL(data);
  });
}

export const APPLICATION = 'application';
export const TEXT = 'text';
export const IMAGE = 'image';

export const mapFileType = (mimeType: string) => {
  if (mimeType.startsWith(APPLICATION) || mimeType.startsWith(TEXT)) {
    const [, ...rest] = mimeType.split('/');
    const fileType = rest.join('');
    switch (fileType) {
      case 'pdf':
        return 'PDF';
      case 'msword':
        return 'Word Document';
      case 'vnd.ms-excel':
      case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'Excel Sheet';
      case 'xml':
        return 'XML';
      case 'zip':
      case '7z':
      case 'vnd.rar':
      case 'x-tar':
        return 'Archive';
      case 'json':
        return 'JSON';
      case 'octet-stream':
        return 'Binary';
      case 'txt':
      case 'plain':
        return 'Text';
      case 'csv':
        return 'CSV';
      case 'x-cit':
        return 'CIT';
      default:
        return fileType;
    }
  }

  if (mimeType.startsWith(IMAGE)) {
    const [, ...rest] = mimeType.split('/');
    const fileType = rest.join('');
    switch (fileType) {
      case 'dwg':
        return 'DWG';
      case 'x-dfx':
        return 'vnd.dgn';
      case 'svg':
      case 'svg+xml':
        return 'SVG';
      default:
        return 'Image';
    }
  }
  return mimeType;
};

interface FileIconMapper {
  [k: string]: string;
}
export const fileIconMapper: FileIconMapper = {
  'image/png': 'file.png',
  'image/jpeg': 'file.jpeg',
  'image/gif': 'file.gif',
  'image/tiff': 'file.tiff',
  'application/pdf': 'file.pdf',
  'application/msword': 'file.docx',
  'application/vnd.ms-excel': 'file.xls',
  'image/svg': 'file.png',
  'image/svg+xml': 'file.png',
  'application/xml': 'file.xml',
  'text/xml': 'file.xml',
  'text/html': 'file.js',
  'application/zip': 'file.zip',
  'application/7z': 'file.7zip',
  'text/plain': 'file.txt',
  'video/x-msvideo': 'file.avi',
  'video/mp4': 'file.mp4',
  'video/quicktime': 'file.mov',
  'video/mpeg': 'file.mp4',
  'application/json': 'file.json',
  'image/dwg': 'file.dwg',
  'image/x-dfx': 'file.dxf',
  'image/vnd.dgn': 'file.dgn',
  'application/x-cit': 'file.cit',
  'text/csv': 'file.csv',
  'application/txt': 'file.txt',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    'file.xls',
  'application/octet-stream': 'file.fbx',
};
