import { DocumentFilterProperty, DocumentSortItem } from '@cognite/sdk';
import { TableSortBy } from 'components/Table';

const columnToSortMap = new Map<string, DocumentFilterProperty>([
  ['name', ['sourceFile', 'name']],
  ['type', ['type']],
  ['author', ['author']],
  ['modifiedTime', ['modifiedTime']],
  ['createdTime', ['createdTime']],
  ['externalId', ['externalId']],
  ['id', ['id']],
]);

export const mapTableSortByToDocumentSortFields = (
  sortBy?: TableSortBy[]
): DocumentSortItem[] | undefined => {
  if (!sortBy || sortBy.length === 0) return undefined;

  // Documents sort only supports for 1 property.
  const { id, desc } = sortBy[0];
  return [
    {
      order: desc ? 'desc' : 'asc',
      property: columnToSortMap.get(id)!,
    },
  ];
};
