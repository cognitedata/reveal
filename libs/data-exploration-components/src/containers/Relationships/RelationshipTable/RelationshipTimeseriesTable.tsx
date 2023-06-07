import React from 'react';

import {
  EmptyState,
  ResourceTableColumns,
  Table,
} from '@data-exploration/components';
import { ResultCount } from '@data-exploration-components/components';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';

import { TimeseriesWithRelationshipLabels } from '@data-exploration-lib/domain-layer';

import { RelationshipTableProps } from './RelationshipTable';

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
