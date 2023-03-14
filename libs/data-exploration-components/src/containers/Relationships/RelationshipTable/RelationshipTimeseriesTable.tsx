import React from 'react';

import { Table } from '@data-exploration-components/components/Table/Table';

import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';

import { ResultCount } from '@data-exploration-components/components';

import { RelationshipTableProps } from './RelationshipTable';
import { TimeseriesWithRelationshipLabels } from '@data-exploration-components/containers/Timeseries/TimeseriesTable/TimeseriesTable';
import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { ResourceTableColumns } from '@data-exploration-components/components/Table/columns';
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
} = ResourceTableColumns;

export function RelationshipTimeseriesTable({
  parentResource,
  onItemClicked,
  onParentAssetClick,
}: Omit<RelationshipTableProps, 'type'> & {
  onParentAssetClick: (assetId: number) => void;
}) {
  const columns = [
    name(),
    relationshipLabels,
    relation,
    externalId(),
    description(),
    lastUpdatedTime,
    created,
    assets((directAsset) => onParentAssetClick(directAsset.id)),
  ] as ColumnDef<TimeseriesWithRelationshipLabels>[];

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
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
