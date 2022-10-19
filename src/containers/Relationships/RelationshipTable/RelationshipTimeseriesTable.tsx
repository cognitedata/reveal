import React from 'react';

import { NewTable } from 'components/ReactTable';

import { useRelatedResourceResults, useRelationshipCount } from 'hooks';

import { ResultCount } from 'components';
import { Column } from 'react-table';
import { RelationshipTableProps } from './RelationshipTable';
import { TimeseriesWithRelationshipLabels } from 'containers/Timeseries/TimeseriesTable/TimeseriesNewTable';
import { RelationshipFilters } from './RelationshipFilters';
import { EmptyState } from 'components/EmpyState/EmptyState';

const {
  relationshipLabels,
  relation,
  externalId,
  name,
  description,
  lastUpdatedTime,
  created,
  assets,
} = NewTable.Columns;

const columns = [
  name,
  relationshipLabels,
  relation,
  externalId,
  description,
  lastUpdatedTime,
  created,
  assets,
] as Column<TimeseriesWithRelationshipLabels>[];

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
      <NewTable
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
