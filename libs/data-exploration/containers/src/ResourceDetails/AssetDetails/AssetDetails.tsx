import React, { FC, useMemo } from 'react';

import {
  DefaultPreviewFilter,
  ResourceDetailsTemplate,
} from '@data-exploration/components';

import { createLink } from '@cognite/cdf-utilities';
import { Collapse, Title } from '@cognite/cogs.js';

import {
  EMPTY_OBJECT,
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  InternalTimeseriesFilters,
  ResourceSelectionMode,
  ResourceType,
  SelectableItemsProps,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useAssetsByIdQuery,
  useEventsSearchResultQuery,
  useTimeseriesSearchResultQuery,
  useAssetsSearchResultQuery,
  useSequenceSearchResultQuery,
  useShamefulDocumentsQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesSmallPreviewTable,
} from '../../DetailsTable';
import { AssetInfo } from '../../Info';
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
  SEQUENCES,
  TIME_SERIES,
} from '../constant';
import { StyledCollapse } from '../elements';
import { useLocalFilterState } from '../hooks';
import { getResourcesVisibility } from '../utils';
export const onOpenResources = (resourceType: ResourceType, id: number) => {
  const link = createLink(`/explore/search/${resourceType}/${id}`);
  window.open(link, '_blank');
};
interface Props {
  assetId: number;
  isSelected: boolean;
  selectionMode?: ResourceSelectionMode;
  closable?: boolean;
  onClose?: () => void;
  selectedRows?: ResourceSelection;
  visibleResources?: ResourceType[];
  showSelectButton?: boolean;
  isDocumentsApiEnabled?: boolean;
}

export const AssetDetails: FC<
  Props & Pick<SelectableItemsProps, 'onSelect'>
> = ({
  assetId,
  isSelected,
  onSelect,
  selectionMode,
  closable,
  onClose,
  selectedRows,
  visibleResources = [],
  showSelectButton,
  isDocumentsApiEnabled = true,
}) => {
  const { t } = useTranslation();
  const { data } = useAssetsByIdQuery([{ id: assetId }]);
  const asset = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);

  const {
    isAssetVisible,
    isFileVisible,
    isTimeseriesVisible,
    isSequenceVisible,
    isEventVisible,
  } = getResourcesVisibility(visibleResources);

  const filter = { assetSubtreeIds: [{ value: assetId }] };

  const {
    query: fileQuery,
    setQuery: setFileQuery,
    debouncedQuery: debouncedFileSearchQuery,
    setFilter: setFileFilter,
    composedFilter: composedFileFilter,
    sortBy: fileSortBy,
    setSortBy: setFileSortBy,
  } = useLocalFilterState<InternalDocumentFilter>({ baseFilter: filter });

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
    results: relatedFiles = [],
    hasNextPage: fileHasNextPage,
    fetchNextPage: fileFetchNextPage,
    isInitialLoading: isFileLoading,
  } = useShamefulDocumentsQuery(
    {
      sortBy: fileSortBy,
      query: debouncedFileSearchQuery,
      filter: composedFileFilter,
      limit: 10,
    },
    {
      isDocumentsApiEnabled,
      isEnabled: isFileVisible,
    }
  );

  const {
    data: relatedTimeseries = [],
    hasNextPage: timeseriesHasNextPage,
    fetchNextPage: timeseriesFetchNextPage,
    isInitialLoading: isTimeseriesLoading,
  } = useTimeseriesSearchResultQuery(
    {
      sortBy: timeseriesSortBy,
      query: debouncedTimeseriesSearchQuery,
      filter: composedTimeseriesFilter,
      limit: 10,
    },
    undefined,
    { enabled: isTimeseriesVisible }
  );

  const {
    data: relatedEvents = [],
    hasNextPage: eventHasNextPage,
    fetchNextPage: eventFetchNextPage,
    isInitialLoading: isEventLoading,
  } = useEventsSearchResultQuery(
    {
      eventsSortBy: eventSortBy,
      query: debouncedEventSearchQuery,
      eventsFilters: composedEventFilter,
      limit: 10,
    },
    undefined,
    { enabled: isEventVisible }
  );

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
    { enabled: isAssetVisible }
  );

  const {
    hasNextPage: hasSequencesNextPage,
    fetchNextPage: hasSequencesFetchNextPage,
    isInitialLoading: isSequencesLoading,
    data: sequences = [],
  } = useSequenceSearchResultQuery(
    {
      filter,
    },
    undefined,
    { enabled: isSequenceVisible }
  );

  const enableDetailTableSelection = selectionMode === 'multiple';

  return (
    <ResourceDetailsTemplate
      title={asset ? asset.name : ''}
      icon="Assets"
      selectionMode={selectionMode}
      isSelected={isSelected}
      closable={closable}
      onClose={onClose}
      onSelectClicked={onSelect}
      showSelectButton={showSelectButton}
    >
      <StyledCollapse accordion ghost defaultActiveKey="details">
        <Collapse.Panel key="details" header={<h4>{t('DETAILS', DETAILS)}</h4>}>
          {asset ? (
            <AssetInfo asset={asset} />
          ) : (
            <Title level={5}>
              {t('NO_DETAILS_AVAILABLE', NO_DETAILS_AVAILABLE)}
            </Title>
          )}
        </Collapse.Panel>
        {isAssetVisible && (
          <Collapse.Panel header={<h4>{t('ASSETS', ASSETS)}</h4>}>
            <AssetDetailsTable
              id="related-asset-asset-details"
              data={relatedAssets}
              hasNextPage={assetsHasNextPage}
              fetchMore={assetsFetchNextPage}
              isLoadingMore={isAssetsLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.asset || {}}
              onRowSelection={(updater, currentAssets) =>
                onSelect?.(updater, currentAssets, 'asset')
              }
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
          <Collapse.Panel header={<h4>{t('TIMESERIES', TIME_SERIES)}</h4>}>
            <TimeseriesSmallPreviewTable
              data={relatedTimeseries}
              fetchMore={timeseriesFetchNextPage}
              hasNextPage={timeseriesHasNextPage}
              isLoading={isTimeseriesLoading}
              enableDetailTableSelection={enableDetailTableSelection}
              selectedRows={selectedRows}
              onSelect={onSelect}
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
          <Collapse.Panel header={<h4>{t('FILES', FILES)}</h4>}>
            <FileDetailsTable
              id="related-file-asset-details"
              data={relatedFiles}
              hasNextPage={fileHasNextPage}
              fetchMore={fileFetchNextPage}
              isLoadingMore={isFileLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.file || {}}
              onRowSelection={(updater, currentFiles) =>
                onSelect?.(updater, currentFiles, 'file')
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
          <Collapse.Panel header={<h4>{t('EVENTS', EVENTS)}</h4>}>
            <EventDetailsTable
              id="related-event-asset-details"
              data={relatedEvents}
              fetchMore={eventFetchNextPage}
              hasNextPage={eventHasNextPage}
              isLoadingMore={isEventLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.event || {}}
              onRowSelection={(updater, currentEvents) =>
                onSelect?.(updater, currentEvents, 'event')
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
            key="document-sequence-detail"
            header={<h4>{t('SEQUENCES', SEQUENCES)}</h4>}
          >
            <SequenceDetailsTable
              id="sequence-resource-asset-detail-table"
              data={sequences}
              hasNextPage={hasSequencesNextPage}
              fetchMore={hasSequencesFetchNextPage}
              isDataLoading={isSequencesLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.sequence || EMPTY_OBJECT}
              onRowSelection={(updater, currentSequences) =>
                onSelect?.(updater, currentSequences, 'sequence')
              }
            />
          </Collapse.Panel>
        )}
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};
