import React, { useMemo } from 'react';

import {
  EmptyState,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import {
  EventWithRelationshipLabels,
  ResultCount,
} from '@data-exploration/containers';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';

import { useTranslation } from '@data-exploration-lib/core';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipEventTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { data: count } = useRelationshipCount(parentResource, 'event');

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(() => {
    return [
      tableColumns.type(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.externalId(),
      tableColumns.lastUpdatedTime,
      tableColumns.created,
    ] as ColumnDef<EventWithRelationshipLabels>[];
  }, []);

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<EventWithRelationshipLabels>(
      'relationship',
      'event',
      parentResource
    );
  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <Table
      id="relationship-event-table"
      columns={columns}
      tableHeaders={<ResultCount api="list" type="event" count={count} />}
      data={items}
      hideColumnToggle
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
