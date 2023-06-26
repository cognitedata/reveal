import React, { useMemo } from 'react';

import {
  EmptyState,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import { ResultCount } from '@data-exploration/containers';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';

import {
  SequenceWithRelationshipLabels,
  useTranslation,
} from '@data-exploration-lib/core';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipSequenceTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.mimeType,
      tableColumns.uploadedTime,
      tableColumns.lastUpdatedTime,
      tableColumns.created,
    ] as ColumnDef<SequenceWithRelationshipLabels>[];
  }, []);

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
