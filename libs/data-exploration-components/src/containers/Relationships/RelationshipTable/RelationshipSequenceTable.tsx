import React from 'react';

import { Table } from '@data-exploration-components/components/Table/Table';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ResultCount } from '@data-exploration-components/components';
import { RelationshipTableProps } from './RelationshipTable';
import { ResourceTableColumns } from '@data-exploration-components/components/Table/columns';

import { SequenceWithRelationshipLabels } from '@data-exploration-components/index';
import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
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
