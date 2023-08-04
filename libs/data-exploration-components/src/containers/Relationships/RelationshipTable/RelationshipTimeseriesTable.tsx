import React, { useMemo } from 'react';

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
  buildAdvancedFilterFromDetailViewData,
  TimeseriesWithRelationshipLabels,
  useRelatedResourceDataForDetailView,
  useTimeseriesListQuery,
} from '@data-exploration-lib/domain-layer';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipTimeseriesTable({
  parentResource,
  labels,
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

  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: parentResource.externalId,
      relationshipResourceType: ResourceTypes.TimeSeries,
      filter: { labels },
    });

  const hasRelationships = !isEmpty(detailViewRelatedResourcesData);

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useTimeseriesListQuery(
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
      id="relationship-timeseries-table"
      columns={columns}
      tableHeaders={
        <SearchResultCountLabel
          loadedCount={tableData.length}
          totalCount={detailViewRelatedResourcesData.length}
          resourceType={ResourceTypes.TimeSeries}
        />
      }
      data={tableData}
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
