import React from 'react';

import { NewTable } from 'components/ReactTable';
import { AssetWithRelationshipLabels } from 'containers/Assets/AssetTable/AssetNewTable';
import { useRelatedResourceResults, useRelationshipCount } from 'hooks';

import { Column } from 'react-table';
import { RelationshipTableProps } from './RelationshipTable';
import { RelationshipFilters } from './RelationshipFilters';
import { EmptyState } from 'components/EmpyState/EmptyState';
import { ResultCount } from 'components';

export function RelationshipAssetTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { relationshipLabels, relation, externalId, rootAsset, name } =
    NewTable.Columns;
  const columns = [
    name,
    relationshipLabels,
    relation,
    externalId,
    rootAsset,
  ] as Column<AssetWithRelationshipLabels>[];

  const {
    hasNextPage,
    fetchNextPage,
    isLoading,
    items,
    relationshipLabelOptions,
    onChangeLabelValue,
    labelValue,
  } = useRelatedResourceResults<AssetWithRelationshipLabels>(
    'relationship',
    'asset',
    parentResource
  );
  const { data: count } = useRelationshipCount(parentResource, 'asset');

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
        tableHeaders={<ResultCount api="list" type="asset" count={count} />}
        columns={columns}
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
