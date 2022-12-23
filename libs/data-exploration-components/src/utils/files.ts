import mime from 'mime-types';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import lowerCase from 'lodash/lowerCase';
import { Document } from '@data-exploration-components/domain/documents';
import { isSupportedFileInfo } from '@cognite/unified-file-viewer';

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

export const isDocument = (item: Document | FileInfo): item is Document => {
  return (item as Document).sourceFile !== undefined;
};

export const isFilePreviewable = (file?: FileInfo | Document) => {
  if (file === undefined) return false;

  if (isDocument(file)) {
    return isSupportedFileInfo(file.sourceFile);
  }
  return isSupportedFileInfo(file);
};

export const isPreviewableImage = (file?: FileInfo | Document) =>
  isFileOfType(file, PREVIEWABLE_IMAGE_TYPES);

export const isFileOfType = (file?: FileInfo | Document, type?: string[]) => {
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
  file: FileInfo | Document
) {
  if (!isFilePreviewable(file)) return undefined;

  // Handle image url
  if (isPreviewableImage(file)) {
    const urls = await sdk.files.getDownloadUrls([{ id: file.id }]);
    const imageUrl = urls[0].downloadUrl;
    return imageUrl;
  }

  return sdk.documents.preview.documentAsImage(file.id, 1).then((response) => {
    const icon = response;
    const arrayBufferView = new Uint8Array(icon);
    const blob = new Blob([arrayBufferView]);
    const objectURL = URL.createObjectURL(blob);
    return objectURL;
  });
}

const APPLICATION = 'application';
const TEXT = 'text';
const IMAGE = 'image';

export const mapFileType = (mimeType: string) => {
  if (mimeType.startsWith(APPLICATION) || mimeType.startsWith(TEXT)) {
    const [, ...rest] = mimeType.split('/');
    const fileType = rest.join('');
    switch (fileType) {
      case 'pdf':
        return 'PDF';
      case 'msword':
        return 'Word Document';
      case 'vnd.ms-excel' ||
        'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'Excel Sheet';
      case 'xml':
        return 'XML';
      case 'zip' || '7z' || 'vnd.rar' || 'x-tar':
        return 'Archive';
      case 'plain':
        return 'Text';
      case 'json':
        return 'JSON';
      case 'octet-stream':
        return 'Binary';
      case 'txt':
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
      case 'svg' || 'svg+xml':
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
};
