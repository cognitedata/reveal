import React, { FC, useEffect, useMemo } from 'react';

import styled from 'styled-components';

import {
  DefaultPreviewFilter,
  ResourceDetailsTemplate,
} from '@data-exploration/components';
import noop from 'lodash/noop';

import { Collapse, Title } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import {
  EMPTY_OBJECT,
  ResourceSelectionMode,
  ResourceType,
  SelectableItemsProps,
  ViewType,
  useTranslation,
  InternalTimeseriesFilters,
  InternalEventsFilters,
  InternalAssetFilters,
} from '@data-exploration-lib/core';
import {
  useAssetsSearchResultQuery,
  useEventsSearchResultQuery,
  useSequenceListQuery,
  useShamefulDocumentsQuery,
  useTimeseriesByIdsQuery,
  useTimeseriesSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';
import { TimeseriesInfo } from '../../Info';
import { ResourceSelection } from '../../ResourceSelector';
import { AssetTableFilters } from '../../Search/SearchResults/AssetSearchResults/AssetTableFilters';
import { EventTableFilters } from '../../Search/SearchResults/EventSearchResults/EventTableFilters';
import { FileTableFiltersDocument } from '../../Search/SearchResults/FileSearchResults/FileTableFilters';
import { TimeseriesTableFilters } from '../../Search/SearchResults/TimeseriesSearchResults/TimeseriesTableFilters';
import {
  ASSETS,
  DETAILS,
  EVENTS,
  FILES,
  NO_DETAILS_AVAILABLE,
  PREVIEW,
  SEQUENCES,
  TIME_SERIES,
} from '../constant';
import { useLocalFilterState } from '../hooks';
import { getResourcesVisibility } from '../utils';

interface Props {
  timeseriesId: number;
  isSelected: boolean;
  closable?: boolean;
  onClose?: () => void;
  selectionMode?: ResourceSelectionMode;
  selectedRows?: ResourceSelection;
  visibleResources?: ResourceType[];
  showSelectButton?: boolean;
  onDateRangeChange?: (dateRange: Record<number, [Date, Date]>) => void;
  isDocumentsApiEnabled?: boolean;
}
export const TimeseriesDetails: FC<
  Props & Pick<SelectableItemsProps, 'onSelect'>
> = ({
  timeseriesId,
  isSelected,
  closable,
  onClose,
  onSelect,
  selectedRows,
  selectionMode,
  visibleResources = [],
  showSelectButton,
  onDateRangeChange = noop,
  isDocumentsApiEnabled = true,
}) => {
  const {
    data,
    isFetched: isTimeseriesFetched,
    isLoading: isParentTimeseriesLoading,
  } = useTimeseriesByIdsQuery([{ id: timeseriesId }]);
  const timeseries = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);
  const { t } = useTranslation();

  const [dateRange, setDateRange] = React.useState<
    Record<number, [Date, Date]> | undefined
  >(undefined);

  useEffect(() => {
    if (dateRange) {
      onDateRangeChange(dateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const {
    isAssetVisible,
    isTimeseriesVisible,
    isFileVisible,
    isEventVisible,
    isSequenceVisible,
  } = getResourcesVisibility(visibleResources);

  const assetIds = timeseries?.assetId ? [timeseries.assetId] : [];

  const isQueryEnabled = isTimeseriesFetched && assetIds.length > 0;

  const filter = {
    assetSubtreeIds: assetIds.map((value) => ({
      value,
    })),
  };

  const {
    query: fileQuery,
    setQuery: setFileQuery,
    debouncedQuery: debouncedFileSearchQuery,
    setFilter: setFileFilter,
    composedFilter: composedFileFilter,
    sortBy: fileSortBy,
    setSortBy: setFileSortBy,
  } = useLocalFilterState<any>({ baseFilter: filter });

  const {
    query: timeseriesQuery,
    setQuery: setTimeseriesQuery,
    debouncedQuery: debouncedTimeseriesSearchQuery,
    setFilter: setTimeseriesFilter,
    composedFilter: composedTimeseriesFilter,
    sortBy: timeseriesSortBy,
    setSortBy: setTimeseriesSortBy,
  } = useLocalFilterState<InternalTimeseriesFilters>({ baseFilter: filter });

  const {
    query: eventQuery,
    setQuery: setEventQuery,
    debouncedQuery: debouncedEventSearchQuery,
    setFilter: setEventFilter,
    composedFilter: composedEventFilter,
    sortBy: eventSortBy,
    setSortBy: setEventSortBy,
  } = useLocalFilterState<InternalEventsFilters>({ baseFilter: filter });

  const {
    query: assetQuery,
    setQuery: setAssetQuery,
    debouncedQuery: debouncedAssetSearchQuery,
    setFilter: setAssetFilter,
    composedFilter: composedAssetFilter,
    sortBy: assetSortBy,
    setSortBy: setAssetSortBy,
  } = useLocalFilterState<InternalAssetFilters>({ baseFilter: filter });

  const {
    data: relatedAssets = [],
    hasNextPage: assetsHasNextPage,
    fetchNextPage: assetsFetchNextPage,
    isInitialLoading: isAssetsLoading,
  } = useAssetsSearchResultQuery(
    {
      query: debouncedAssetSearchQuery,
      assetFilter: composedAssetFilter,
      sortBy: assetSortBy,
      limit: 10,
    },
    { enabled: isQueryEnabled && isAssetVisible && assetIds.length > 0 }
  );

  const {
    hasNextPage: hasEventNextPage,
    fetchNextPage: hasEventFetchNextPage,
    isInitialLoading: isEventsLoading,
    data: events,
  } = useEventsSearchResultQuery(
    {
      eventsFilters: composedEventFilter,
      eventsSortBy: eventSortBy,
      query: debouncedEventSearchQuery,
    },
    undefined,
    {
      enabled: isQueryEnabled && isEventVisible,
    }
  );

  const {
    hasNextPage: hasTimeseriesNextPage,
    fetchNextPage: hasTimeseriesFetchNextPage,
    isInitialLoading: isTimeseriesLoading,
    data: relatedTimeseries,
  } = useTimeseriesSearchResultQuery(
    {
      query: debouncedTimeseriesSearchQuery,
      filter: composedTimeseriesFilter,
      sortBy: timeseriesSortBy,
    },
    undefined,
    {
      enabled: isQueryEnabled && isTimeseriesVisible,
    }
  );

  const {
    results: relatedDocuments = [],
    hasNextPage: hasDocumentsNextPage,
    fetchNextPage: hasDocumentsFetchNextPage,
    isInitialLoading: isDocumentsLoading,
  } = useShamefulDocumentsQuery(
    {
      sortBy: fileSortBy,
      query: debouncedFileSearchQuery,
      filter: composedFileFilter,
      limit: 10,
    },
    {
      isDocumentsApiEnabled,
      isEnabled: isQueryEnabled && isFileVisible,
    }
  );

  const {
    hasNextPage: hasSequencesNextPage,
    fetchNextPage: hasSequencesFetchNextPage,
    isInitialLoading: isSequencesLoading,
    data: sequences = [],
  } = useSequenceListQuery(
    {
      filter: {
        assetIds,
      },
    },
    { enabled: isQueryEnabled && isSequenceVisible }
  );

  const onCloseHandler = () => {
    onClose && onClose();
    setDateRange(undefined);
  };

  const onDateRangeChangeHandler = (
    range: [Date, Date],
    selectedTimeseriesId: number
  ) => {
    setDateRange((prevState) => {
      if (!prevState || prevState[selectedTimeseriesId] !== range)
        return { ...prevState, [selectedTimeseriesId]: range };
      return prevState;
    });
  };

  const enableDetailTableSelection = selectionMode === 'multiple';

  return (
    <ResourceDetailsTemplate
      title={timeseries ? timeseries.name || '' : ''}
      icon="Timeseries"
      selectionMode={selectionMode}
      isSelected={isSelected}
      closable={closable}
      onClose={onCloseHandler}
      onSelectClicked={onSelect}
      showSelectButton={showSelectButton}
    >
      <StyledCollapse accordion ghost defaultActiveKey="preview">
        {timeseries ? (
          <Collapse.Panel
            key="preview"
            header={<h4>{t('PREVIEW', PREVIEW)}</h4>}
          >
            <TimeseriesChart
              timeseries={{ id: timeseries.id }}
              height={400}
              quickTimePeriodOptions={['1D', '1W', '1Y']}
              onChangeDateRange={(range) =>
                onDateRangeChangeHandler(range, timeseries.id)
              }
              dateRange={dateRange && dateRange[timeseries.id]}
            />
          </Collapse.Panel>
        ) : null}
        <Collapse.Panel
          key="timeseries-details"
          header={<h4>{t('DETAILS', DETAILS)}</h4>}
        >
          {timeseries ? (
            <TimeseriesInfo timeseries={timeseries} />
          ) : (
            <Title level={5}>
              {t('NO_DETAILS_AVAILABLE', NO_DETAILS_AVAILABLE)}
            </Title>
          )}
        </Collapse.Panel>
        {isAssetVisible && (
          <Collapse.Panel header={<h4>{t('ASSETS', ASSETS)}</h4>}>
            <AssetDetailsTable
              id="related-asset-timeseries-details"
              data={relatedAssets}
              isLoadingMore={isAssetsLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.asset || EMPTY_OBJECT}
              onRowSelection={(updater, currentAssets) =>
                onSelect?.(updater, currentAssets, ViewType.Asset)
              }
              hasNextPage={assetsHasNextPage}
              fetchMore={assetsFetchNextPage}
              enableSorting
              sorting={assetSortBy}
              onSort={setAssetSortBy}
              tableHeaders={
                <DefaultPreviewFilter
                  query={assetQuery}
                  onQueryChange={setAssetQuery}
                >
                  <AssetTableFilters
                    filter={composedAssetFilter}
                    onFilterChange={setAssetFilter}
                  />
                </DefaultPreviewFilter>
              }
            />
          </Collapse.Panel>
        )}
        {isTimeseriesVisible && (
          <Collapse.Panel
            key="event-timeseries-detail"
            header={<h4>{t('TIMESERIES', TIME_SERIES)}</h4>}
          >
            <TimeseriesDetailsTable
              id="timeseries-resource-event-detail-table"
              data={relatedTimeseries}
              hasNextPage={hasTimeseriesNextPage}
              fetchMore={hasTimeseriesFetchNextPage}
              isDataLoading={isParentTimeseriesLoading || isTimeseriesLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.timeSeries || EMPTY_OBJECT}
              onRowSelection={(updater, currentTimeseries) =>
                onSelect?.(updater, currentTimeseries, ViewType.TimeSeries)
              }
              enableSorting
              sorting={timeseriesSortBy}
              onSort={setTimeseriesSortBy}
              tableHeaders={
                <DefaultPreviewFilter
                  query={timeseriesQuery}
                  onQueryChange={setTimeseriesQuery}
                >
                  <TimeseriesTableFilters
                    filter={composedTimeseriesFilter}
                    onFilterChange={setTimeseriesFilter}
                  />
                </DefaultPreviewFilter>
              }
            />
          </Collapse.Panel>
        )}
        {isFileVisible && (
          <Collapse.Panel
            key="timeseries-documents-detail"
            header={<h4>{t('FILES', FILES)}</h4>}
          >
            <FileDetailsTable
              id="documents-resource-timeseries-detail-table"
              data={relatedDocuments}
              hasNextPage={hasDocumentsNextPage}
              fetchMore={hasDocumentsFetchNextPage}
              isDataLoading={isParentTimeseriesLoading || isDocumentsLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.file || EMPTY_OBJECT}
              onRowSelection={(updater, currentFiles) =>
                onSelect?.(updater, currentFiles, ViewType.File)
              }
              enableSorting={isDocumentsApiEnabled}
              sorting={fileSortBy}
              onSort={setFileSortBy}
              tableHeaders={
                isDocumentsApiEnabled ? (
                  <DefaultPreviewFilter
                    query={fileQuery}
                    onQueryChange={setFileQuery}
                  >
                    <FileTableFiltersDocument
                      filter={composedFileFilter}
                      onFilterChange={setFileFilter}
                    />
                  </DefaultPreviewFilter>
                ) : undefined
              }
            />
          </Collapse.Panel>
        )}
        {isEventVisible && (
          <Collapse.Panel
            key="timeseries-events-detail"
            header={<h4>{t('EVENTS', EVENTS)}</h4>}
          >
            <EventDetailsTable
              id="event-resource-timeseries-detail-table"
              data={events}
              hasNextPage={hasEventNextPage}
              fetchMore={hasEventFetchNextPage}
              isDataLoading={isParentTimeseriesLoading || isEventsLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.event || EMPTY_OBJECT}
              onRowSelection={(updater, currentEvents) =>
                onSelect?.(updater, currentEvents, ViewType.Event)
              }
              enableSorting
              sorting={eventSortBy}
              onSort={setEventSortBy}
              tableHeaders={
                <DefaultPreviewFilter
                  query={eventQuery}
                  onQueryChange={setEventQuery}
                >
                  <EventTableFilters
                    filter={composedEventFilter}
                    onFilterChange={setEventFilter}
                  />
                </DefaultPreviewFilter>
              }
            />
          </Collapse.Panel>
        )}
        {isSequenceVisible && (
          <Collapse.Panel
            key="timeseries-sequence-detail"
            header={<h4>{t('SEQUENCES', SEQUENCES)}</h4>}
          >
            <SequenceDetailsTable
              id="sequence-resource-timeseries-detail-table"
              data={sequences}
              hasNextPage={hasSequencesNextPage}
              fetchMore={hasSequencesFetchNextPage}
              isDataLoading={isParentTimeseriesLoading || isSequencesLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.sequence || EMPTY_OBJECT}
              onRowSelection={(updater, currentSequences) =>
                onSelect?.(updater, currentSequences, ViewType.Sequence)
              }
            />
          </Collapse.Panel>
        )}
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};

const StyledCollapse = styled(Collapse)`
  overflow: auto;
`;
