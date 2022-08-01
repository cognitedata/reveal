import { Table } from 'components';

const APPLICATION = 'application';
const TEXT = 'text';
const IMAGE = 'image';
export const getIdParam = (id: number | string) => {
  if (typeof id === 'string') {
    return { externalId: id };
  }
  return { id };
};

export const sleep = (milliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

export function getColumnsWithRelationshipLabels(
  columns: any,
  relationshipLabels?: boolean
) {
  const modifiedColumns = [
    ...columns.slice(0, 1),

    Table.Columns.relationshipLabels,
    Table.Columns.relation,

    ...columns.slice(1),
  ];
  return relationshipLabels ? modifiedColumns : columns;
}

export const mapFileType = (mimeType: string) => {
  if (mimeType.startsWith(APPLICATION) || mimeType.startsWith(TEXT)) {
    const [, ...rest] = mimeType.split('/');
    return rest.join('');
  }
  if (mimeType.startsWith(IMAGE)) return 'Image';
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
};
