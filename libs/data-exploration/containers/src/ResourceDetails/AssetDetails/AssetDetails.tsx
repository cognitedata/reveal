import React, { FC, useMemo } from 'react';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import { createLink } from '@cognite/cdf-utilities';
import { Collapse, Title } from '@cognite/cogs.js';

import {
  EMPTY_OBJECT,
  ResourceType,
  SelectableItemsProps,
} from '@data-exploration-lib/core';
import {
  useAssetsByIdQuery,
  useEventsSearchResultQuery,
  useTimeseriesSearchResultQuery,
  useAssetsSearchResultQuery,
  useSequenceSearchResultQuery,
  useFileSearchQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';
import { AssetInfo } from '../../Info';
import { ResourceSelection } from '../../ResourceSelector';
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
import { getResourcesVisibility } from '../utils';
export const onOpenResources = (resourceType: ResourceType, id: number) => {
  const link = createLink(`/explore/search/${resourceType}/${id}`);
  window.open(link, '_blank');
};
interface Props {
  assetId: number;
  isSelected: boolean;
  selectionMode?: 'single' | 'multiple';

  onClose?: () => void;
  selectedRows?: ResourceSelection;
  visibleResources?: ResourceType[];
}
export const AssetDetails: FC<
  Props & Pick<SelectableItemsProps, 'onSelect'>
> = ({
  assetId,
  isSelected,
  onSelect,
  selectionMode,
  onClose,
  selectedRows,
  visibleResources = [],
}) => {
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
    results: relatedFiles = [],
    hasNextPage: fileHasNextPage,
    fetchNextPage: fileFetchNextPage,
    isInitialLoading: isFileLoading,
  } = useFileSearchQuery(
    {
      filter: {
        assetSubtreeIds: [{ id: assetId }],
      },
      limit: 10,
    },
    { enabled: isFileVisible }
  );

  const {
    data: relatedTimeseries = [],
    hasNextPage: timeseriesHasNextPage,
    fetchNextPage: timeseriesFetchNextPage,
    isInitialLoading: isTimeseriesLoading,
  } = useTimeseriesSearchResultQuery(
    {
      filter,
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
      eventsFilters: filter,
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
      assetFilter: filter,
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
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelect}
    >
      <StyledCollapse accordion ghost defaultActiveKey="details">
        <Collapse.Panel key="details" header={<h4>{DETAILS}</h4>}>
          {asset ? (
            <AssetInfo asset={asset} />
          ) : (
            <Title level={5}>{NO_DETAILS_AVAILABLE}</Title>
          )}
        </Collapse.Panel>
        {isAssetVisible && (
          <Collapse.Panel header={<h4>{ASSETS}</h4>}>
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
            />
          </Collapse.Panel>
        )}

        {isTimeseriesVisible && (
          <Collapse.Panel header={<h4>{TIME_SERIES}</h4>}>
            <TimeseriesDetailsTable
              id="related-timeseries-asset-details"
              data={relatedTimeseries}
              fetchMore={timeseriesFetchNextPage}
              hasNextPage={timeseriesHasNextPage}
              isLoadingMore={isTimeseriesLoading}
              enableSelection={enableDetailTableSelection}
              selectedRows={selectedRows?.timeSeries || {}}
              onRowSelection={(updater, currentTimeseries) =>
                onSelect?.(updater, currentTimeseries, 'timeSeries')
              }
            />
          </Collapse.Panel>
        )}
        {isFileVisible && (
          <Collapse.Panel header={<h4>{FILES}</h4>}>
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
            />
          </Collapse.Panel>
        )}
        {isEventVisible && (
          <Collapse.Panel header={<h4>{EVENTS}</h4>}>
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
            />
          </Collapse.Panel>
        )}
        {isSequenceVisible && (
          <Collapse.Panel
            key="document-sequence-detail"
            header={<h4>{SEQUENCES}</h4>}
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
