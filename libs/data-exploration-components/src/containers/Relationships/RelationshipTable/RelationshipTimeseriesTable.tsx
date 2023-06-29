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

import { useTranslation } from '@data-exploration-lib/core';
import { TimeseriesWithRelationshipLabels } from '@data-exploration-lib/domain-layer';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipTimeseriesTable({
  parentResource,
  onItemClicked,
  onParentAssetClick,
}: Omit<RelationshipTableProps, 'type'> & {
  onParentAssetClick: (assetId: number) => void;
}) {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.externalId(),
      tableColumns.description(),
      tableColumns.lastUpdatedTime,
      tableColumns.created,
      tableColumns.assets((directAsset) => onParentAssetClick(directAsset.id)),
    ] as ColumnDef<TimeseriesWithRelationshipLabels>[];
  }, []);

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
