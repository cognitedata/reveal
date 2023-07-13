import { useMemo } from 'react';

import {
  EmptyState,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import {
  EventWithRelationshipLabels,
  SearchResultCountLabel,
} from '@data-exploration/containers';
import { ColumnDef } from '@tanstack/react-table';

import { ResourceTypes, useTranslation } from '@data-exploration-lib/core';
import {
  addDetailViewData,
  buildAdvancedFilterFromDetailViewData,
  useEventsListQuery,
  useRelatedResourceDataForDetailView,
} from '@data-exploration-lib/domain-layer';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipEventTable({
  parentResource,
  labels,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(() => {
    return [
      tableColumns.type(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.externalId(),
      tableColumns.lastUpdatedTime,
      tableColumns.created,
    ] as ColumnDef<EventWithRelationshipLabels>[];
  }, []);

  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: parentResource.externalId,
      relationshipResourceType: ResourceTypes.Event,
      filter: { labels },
    });

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useEventsListQuery({
    advancedFilter: buildAdvancedFilterFromDetailViewData(
      detailViewRelatedResourcesData
    ),
    limit: 20,
  });

  const tableData = useMemo(() => {
    return addDetailViewData(data, detailViewRelatedResourcesData);
  }, [data, detailViewRelatedResourcesData]);

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <Table
      id="relationship-event-table"
      columns={columns}
      tableHeaders={
        <SearchResultCountLabel
          loadedCount={tableData.length}
          totalCount={detailViewRelatedResourcesData.length}
          resourceType={ResourceTypes.Event}
        />
      }
      data={tableData}
      hideColumnToggle
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
