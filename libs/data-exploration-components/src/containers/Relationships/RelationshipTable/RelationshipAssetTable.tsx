import React from 'react';

import { Table } from 'components/Table/Table';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetTable';
import { useRelatedResourceResults, useRelationshipCount } from 'hooks';

import { RelationshipTableProps } from './RelationshipTable';

import { EmptyState } from 'components/EmpyState/EmptyState';
import { ResultCount } from '@data-exploration-components/components';
import { ColumnDef } from '@tanstack/react-table';

export function RelationshipAssetTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { relationshipLabels, relation, externalId, rootAsset, name } =
    Table.Columns;
  const columns = [
    name(),
    relationshipLabels,
    relation,
    externalId(),
    rootAsset,
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
