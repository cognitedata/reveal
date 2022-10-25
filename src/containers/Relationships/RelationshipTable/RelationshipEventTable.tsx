import React from 'react';

import { NewTable } from 'components/ReactTable';
import { useRelatedResourceResults, useRelationshipCount } from 'hooks';
import { ResultCount } from 'components';
import { Column } from 'react-table';
import { RelationshipTableProps } from './RelationshipTable';
import { EventWithRelationshipLabels } from 'containers/Events/EventTable/EventNewTable';

import { EmptyState } from 'components/EmpyState/EmptyState';

const {
  relationshipLabels,
  relation,
  externalId,
  type,
  lastUpdatedTime,
  created,
} = NewTable.Columns;

const columns = [
  type,
  relationshipLabels,
  relation,
  externalId,
  lastUpdatedTime,
  created,
] as Column<EventWithRelationshipLabels>[];

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
    <NewTable
      columns={columns}
      tableHeaders={<ResultCount api="list" type="event" count={count} />}
      data={items}
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={row => onItemClicked(row.id)}
    />
  );
}
