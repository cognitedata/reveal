import React, { FC, useMemo } from 'react';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import { createLink } from '@cognite/cdf-utilities';
import { Collapse, Title } from '@cognite/cogs.js';

import { ResourceType, SelectableItemsProps } from '@data-exploration-lib/core';
import {
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
  useEventsSearchResultQuery,
  useTimeseriesSearchResultQuery,
  useAssetsSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
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
  TIME_SERIES,
} from '../constant';
import { StyledCollapse } from '../elements';

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
}) => {
  const { data } = useAssetsByIdQuery([{ id: assetId }]);
  const asset = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);

  const filter = { assetSubtreeIds: [{ value: assetId }] };
  const {
    results: relatedFiles = [],
    hasNextPage: fileHasNextPage,
    fetchNextPage: fileFetchNextPage,
    isLoading: isFileLoading,
  } = useDocumentSearchResultQuery({
    filter,
    limit: 10,
  });
  const {
    data: relatedTimeseries = [],
    hasNextPage: timeseriesHasNextPage,
    fetchNextPage: timeseriesFetchNextPage,
    isLoading: isTimeseriesLoading,
  } = useTimeseriesSearchResultQuery({
    filter,
    limit: 10,
  });

  const {
    data: relatedEvents = [],
    hasNextPage: eventHasNextPage,
    fetchNextPage: eventFetchNextPage,
    isLoading: isEventLoading,
  } = useEventsSearchResultQuery({
    eventsFilters: filter,
    limit: 10,
  });

  const {
    data: relatedAssets = [],
    hasNextPage: assetsHasNextPage,
    fetchNextPage: assetsFetchNextPage,
    isLoading: isAssetsLoading,
  } = useAssetsSearchResultQuery({
    assetFilter: filter,
    limit: 10,
  });

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
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};
