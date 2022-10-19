import { DocumentFilterProperty } from '@cognite/sdk';

const columnToSortMap = new Map<string, DocumentFilterProperty>([
  ['name', ['sourceFile', 'name']],
  ['mimeType', ['sourceFile', 'mimeType']],
  ['modifiedTime', ['modifiedTime']],
  ['createdTime', ['createdTime']],
  ['externalId', ['externalId']],
  ['id', ['id']],
]);

export const mapColumnsToDocumentSortFields = (column: string) => {
  return columnToSortMap.get(column)!;
};
