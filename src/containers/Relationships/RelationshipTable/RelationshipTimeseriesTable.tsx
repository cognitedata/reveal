import React from 'react';

import { Table } from 'components/Table/Table';

import { useRelatedResourceResults, useRelationshipCount } from 'hooks';

import { ResultCount } from 'components';

import { RelationshipTableProps } from './RelationshipTable';
import { TimeseriesWithRelationshipLabels } from 'containers/Timeseries/TimeseriesTable/TimeseriesTable';
import { EmptyState } from 'components/EmpyState/EmptyState';
import { ColumnDef } from '@tanstack/react-table';

const {
  relationshipLabels,
  relation,
  externalId,
  name,
  description,
  lastUpdatedTime,
  created,
  assets,
} = Table.Columns;

const columns = [
  name,
  relationshipLabels,
  relation,
  externalId,
  description,
  lastUpdatedTime,
  created,
  assets,
] as ColumnDef<TimeseriesWithRelationshipLabels>[];

export function RelationshipTimeseriesTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { data: count } = useRelationshipCount(parentResource, 'timeSeries');

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<TimeseriesWithRelationshipLabels>(
      'relationship',
      'timeSeries',
      parentResource
    );

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <Table
      id="relationship-timeseries-table"
      columns={columns}
      tableHeaders={<ResultCount api="list" type="timeSeries" count={count} />}
      data={items}
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={row => onItemClicked(row.id)}
    />
  );
}
