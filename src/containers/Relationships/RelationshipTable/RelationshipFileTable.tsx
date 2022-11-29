import React from 'react';
import { useRelatedResourceResults, useRelationshipCount } from 'hooks';
import { ResultCount } from 'components';
import { Table } from 'components/Table/Table';
import { ResourceTableColumns } from 'components/Table/columns';
import { RelationshipTableProps } from './RelationshipTable';

import { FileWithRelationshipLabels } from 'containers/Files/FileTable/FileTable';
import { EmptyState } from 'components/EmpyState/EmptyState';
import { ColumnDef } from '@tanstack/react-table';

const {
  relationshipLabels,
  relation,
  name,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
} = ResourceTableColumns;

const columns = [
  name(),
  relationshipLabels,
  relation,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
] as ColumnDef<FileWithRelationshipLabels>[];

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
    <Table
      id="relationship-file-table"
      hideColumnToggle
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
