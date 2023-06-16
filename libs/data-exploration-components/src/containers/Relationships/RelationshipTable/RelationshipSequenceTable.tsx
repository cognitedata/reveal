import React from 'react';

import {
  EmptyState,
  ResourceTableColumns,
  Table,
} from '@data-exploration/components';
import { ResultCount } from '@data-exploration/containers';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';

import { SequenceWithRelationshipLabels } from '@data-exploration-lib/core';

import { RelationshipTableProps } from './RelationshipTable';

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
] as ColumnDef<SequenceWithRelationshipLabels>[];

export function RelationshipSequenceTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { data: count } = useRelationshipCount(parentResource, 'sequence');

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<SequenceWithRelationshipLabels>(
      'relationship',
      'sequence',
      parentResource
    );
  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <Table
      id="relationship-sequence-table"
      columns={columns}
      tableHeaders={<ResultCount api="list" type="sequence" count={count} />}
      data={items}
      showLoadButton
      hideColumnToggle
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
