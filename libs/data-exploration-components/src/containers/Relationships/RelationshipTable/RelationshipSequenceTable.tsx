import React, { useMemo } from 'react';

import {
  EmptyState,
  getTableColumns,
  Table,
} from '@data-exploration/components';
import { SearchResultCountLabel } from '@data-exploration/containers';
import { ColumnDef } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';

import {
  ResourceTypes,
  SequenceWithRelationshipLabels,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  addDetailViewData,
  buildAdvancedFilterFromDetailViewData,
  useRelatedResourceDataForDetailView,
  useSequenceListQuery,
} from '@data-exploration-lib/domain-layer';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipSequenceTable({
  parentResource,
  labels,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(() => {
    return [
      tableColumns.name(),
      tableColumns.relationshipLabels,
      tableColumns.relation,
      tableColumns.mimeType,
      tableColumns.uploadedTime,
      tableColumns.lastUpdatedTime,
      tableColumns.created,
    ] as ColumnDef<SequenceWithRelationshipLabels>[];
  }, []);

  const { data: detailViewRelatedResourcesData } =
    useRelatedResourceDataForDetailView({
      resourceExternalId: parentResource.externalId,
      relationshipResourceType: ResourceTypes.Sequence,
      filter: { labels },
    });

  const hasRelationships = !isEmpty(detailViewRelatedResourcesData);

  const {
    data = [],
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useSequenceListQuery(
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
      id="relationship-sequence-table"
      columns={columns}
      tableHeaders={
        <SearchResultCountLabel
          loadedCount={tableData.length}
          totalCount={detailViewRelatedResourcesData.length}
          resourceType={ResourceTypes.Sequence}
        />
      }
      data={tableData}
      showLoadButton
      hideColumnToggle
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
