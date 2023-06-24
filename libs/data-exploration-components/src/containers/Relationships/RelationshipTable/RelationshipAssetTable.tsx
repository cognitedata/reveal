import React from 'react';

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
import { AssetWithRelationshipLabels } from '@data-exploration-lib/domain-layer';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipAssetTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const { relationshipLabels, relation, externalId, rootAsset, name } =
    tableColumns;

  const columns = [
    name(),
    relationshipLabels,
    relation,
    externalId(),
    rootAsset((row) => onItemClicked(row.id)),
  ] as ColumnDef<AssetWithRelationshipLabels>[];

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<AssetWithRelationshipLabels>(
      'relationship',
      'asset',
      parentResource
    );
  const { data: count } = useRelationshipCount(parentResource, 'asset');

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <Table
      id="relationship-asset-table"
      tableHeaders={<ResultCount api="list" type="asset" count={count} />}
      columns={columns}
      data={items}
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      hideColumnToggle
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
