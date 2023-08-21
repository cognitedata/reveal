import React, { FC, useMemo } from 'react';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import { createLink } from '@cognite/cdf-utilities';
import { Collapse, Title } from '@cognite/cogs.js';

import {
  EMPTY_OBJECT,
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
  useFileSearchQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimesereisSmallPreviewTable,
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
  closable?: boolean;
  onClose?: () => void;
  selectedRows?: ResourceSelection;
  visibleResources?: ResourceType[];
  showSelectButton?: boolean;
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
}) => {
  const { data } = useAssetsByIdQuery([{ id: assetId }]);
  const asset = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);
  const { t } = useTranslation();

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
            />
          </Collapse.Panel>
        )}

        {isTimeseriesVisible && (
          <Collapse.Panel header={<h4>{t('TIMESERIES', TIME_SERIES)}</h4>}>
            <TimesereisSmallPreviewTable
              data={relatedTimeseries}
              fetchMore={timeseriesFetchNextPage}
              hasNextPage={timeseriesHasNextPage}
              isLoading={isTimeseriesLoading}
              enableDetailTableSelection={enableDetailTableSelection}
              selectedRows={selectedRows}
              onSelect={onSelect}
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
