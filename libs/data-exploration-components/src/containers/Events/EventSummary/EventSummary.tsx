import React, { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
} from '@data-exploration/components';
import { useEventsMetadataColumns } from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { useUniqueCdfItems } from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';
import uniqBy from 'lodash/uniqBy';

import { Asset, CogniteEvent } from '@cognite/sdk';

import {
  getHiddenColumns,
  InternalEventsFilters,
  isObjectEmpty,
  isSummaryCardDataCountExceed,
  useDeepMemo,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useEventsSearchResultWithLabelsQuery,
  InternalEventDataWithMatchingLabels,
  useRelatedEventsQuery,
  InternalEventsData,
} from '@data-exploration-lib/domain-layer';

export const EventSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
  onDirectAssetClick = noop,
  isAdvancedFiltersEnabled = false,
  showAllResultsWithEmptyFilters = false,
  selectedResourceExternalId: resourceExternalId,
  annotationIds = [],
}: {
  query?: string;
  filter?: InternalEventsFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: CogniteEvent) => void;
  onDirectAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  isAdvancedFiltersEnabled?: boolean;
  showAllResultsWithEmptyFilters?: boolean;
  selectedResourceExternalId?: string;
  annotationIds?: number[];
}) => {
  const isQueryEnable = isObjectEmpty(filter as any)
    ? showAllResultsWithEmptyFilters
    : true;

  const { data: annotationList = [] } = useUniqueCdfItems<InternalEventsData>(
    'events',
    annotationIds.map((id) => ({ id })),
    true
  );

  const isAnnotationCountExceed = isSummaryCardDataCountExceed(
    annotationList.length
  );

  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');
  const { data: events, isLoading } = useEventsSearchResultWithLabelsQuery(
    {
      query,
      eventsFilters: filter,
    },
    eventSearchConfig,
    { enabled: isQueryEnable && !isAnnotationCountExceed }
  );

  const isEventsCountExceed = isSummaryCardDataCountExceed(
    events.length + annotationList.length
  );

  const { data: relatedEvents, isLoading: isRelatedEventsLoading } =
    useRelatedEventsQuery({
      resourceExternalId,
      enabled: !isEventsCountExceed,
    });

  const mergeData = useDeepMemo(
    () => uniqBy([...annotationList, ...events, ...relatedEvents], 'id'),
    [annotationList, events, relatedEvents]
  );

  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const { metadataColumns, setMetadataKeyQuery } = useEventsMetadataColumns();

  const columns = useMemo(
    () =>
      [
        tableColumns.type(),
        tableColumns.subtype(),
        tableColumns.description(),
        tableColumns.externalId(),
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        tableColumns.id(),
        tableColumns.dataSet,
        tableColumns.startTime,
        tableColumns.endTime,
        tableColumns.source(),
        tableColumns.assets(onDirectAssetClick),
        ...metadataColumns,
      ] as ColumnDef<CogniteEvent>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

  const hiddenColumns = getHiddenColumns(columns, ['type', 'description']);

  const isDataLoading = isLoading && isQueryEnable && !isAnnotationCountExceed;
  const isRelatedDataLoading = isRelatedEventsLoading && !isEventsCountExceed;

  return (
    <SummaryCardWrapper data-testid="event-summary">
      <Table<InternalEventDataWithMatchingLabels>
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(mergeData)}
        columnSelectionLimit={2}
        id="events-summary-table"
        isDataLoading={isDataLoading || isRelatedDataLoading}
        tableHeaders={
          <SummaryHeader
            icon="Events"
            title={t('EVENTS', 'Events')}
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
        onChangeSearchInput={setMetadataKeyQuery}
      />
    </SummaryCardWrapper>
  );
};
