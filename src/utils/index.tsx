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
