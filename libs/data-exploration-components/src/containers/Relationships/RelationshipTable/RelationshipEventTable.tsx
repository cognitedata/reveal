import React from 'react';
import { Table } from '@data-exploration-components/components/Table/Table';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ResourceTableColumns } from '@data-exploration-components/components/Table/columns';
import { RelationshipTableProps } from './RelationshipTable';
import { EventWithRelationshipLabels } from '@data-exploration-components/containers/Events/EventTable/EventTable';

import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { ColumnDef } from '@tanstack/react-table';
import { ResultCount } from '@data-exploration-components/components/ResultCount/ResultCount';

const {
  relationshipLabels,
  relation,
  externalId,
  type,
  lastUpdatedTime,
  created,
} = ResourceTableColumns;

const columns = [
  type(),
  relationshipLabels,
  relation,
  externalId(),
  lastUpdatedTime,
  created,
] as ColumnDef<EventWithRelationshipLabels>[];

export function RelationshipEventTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { data: count } = useRelationshipCount(parentResource, 'event');

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
