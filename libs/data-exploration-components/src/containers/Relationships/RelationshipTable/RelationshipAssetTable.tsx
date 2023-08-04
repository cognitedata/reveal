import { useMemo } from 'react';

import {
  EmptyState,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import { SearchResultCountLabel } from '@data-exploration/containers';
import { ColumnDef } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';

import { ResourceTypes, useTranslation } from '@data-exploration-lib/core';
import {
  addDetailViewData,
  AssetWithRelationshipLabels,
  buildAdvancedFilterFromDetailViewData,
  useAssetsListQuery,
  useRelatedResourceDataForDetailView,
} from '@data-exploration-lib/domain-layer';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipAssetTable({
  parentResource,
  labels,
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

  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: parentResource.externalId,
      relationshipResourceType: ResourceTypes.Asset,
      filter: { labels },
    });

  const hasRelationships = !isEmpty(detailViewRelatedResourcesData);

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useAssetsListQuery(
    {
      advancedFilter: buildAdvancedFilterFromDetailViewData(
        detailViewRelatedResourcesData
      ),
      limit: 20,
    },
    { enabled: hasRelationships }
  );

  const tableData = useMemo(() => {
    return addDetailViewData(data, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  if (isEmpty(tableData)) {
    return <EmptyState isLoading={hasRelationships && isLoading} />;
  }

  return (
    <Table
      id="relationship-asset-table"
      tableHeaders={
        <SearchResultCountLabel
          loadedCount={tableData.length}
          totalCount={detailViewRelatedResourcesData.length}
          resourceType={ResourceTypes.Asset}
        />
      }
      columns={columns}
      data={tableData}
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      hideColumnToggle
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
