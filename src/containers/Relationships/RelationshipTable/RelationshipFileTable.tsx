import React from 'react';

import { NewTable } from 'components/ReactTable';
import { useRelatedResourceResults, useRelationshipCount } from 'hooks';

import { ResultCount } from 'components';
import { Column } from 'react-table';
import { RelationshipTableProps } from './RelationshipTable';

import { FileWithRelationshipLabels } from 'containers/Files/FileTable/FileNewTable';
import { EmptyState } from 'components/EmpyState/EmptyState';

const {
  relationshipLabels,
  relation,
  name,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
} = NewTable.Columns;

const columns = [
  name,
  relationshipLabels,
  relation,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
] as Column<FileWithRelationshipLabels>[];

export function RelationshipFileTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { data: count } = useRelationshipCount(parentResource, 'file');

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<FileWithRelationshipLabels>(
      'relationship',
      'file',
      parentResource
    );
  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <NewTable
      columns={columns}
      tableHeaders={<ResultCount api="list" type="file" count={count} />}
      data={items}
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={row => onItemClicked(row.id)}
    />
  );
}
