import React from 'react';

import { TableV2 as Table } from 'components/ReactTable/V2/TableV2';

import { useRelatedResourceResults, useRelationshipCount } from 'hooks';

import { ResultCount } from 'components';

import { RelationshipTableProps } from './RelationshipTable';
import { TimeseriesWithRelationshipLabels } from 'containers/Timeseries/TimeseriesTable/TimeseriesNewTable';
import { RelationshipFilters } from './RelationshipFilters';
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

  const {
    hasNextPage,
    fetchNextPage,
    isLoading,
    items,
    relationshipLabelOptions,
    onChangeLabelValue,
    labelValue,
  } = useRelatedResourceResults<TimeseriesWithRelationshipLabels>(
    'relationship',
    'timeSeries',
    parentResource
  );
  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <>
      <RelationshipFilters
        options={relationshipLabelOptions}
        onChange={onChangeLabelValue}
        value={labelValue}
      />
      <Table
        id="relationship-timeseries-table"
        columns={columns}
        tableHeaders={
          <ResultCount api="list" type="timeSeries" count={count} />
        }
        data={items}
        showLoadButton
        fetchMore={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoading}
        onRowClick={row => onItemClicked(row.id)}
      />
    </>
  );
}
