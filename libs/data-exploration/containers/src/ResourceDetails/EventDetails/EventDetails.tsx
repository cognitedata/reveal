import React, { FC } from 'react';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import { Collapse, Title } from '@cognite/cogs.js';

import { ResourceItem } from '@data-exploration-lib/core';
import {
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
  useEventsByIdsQuery,
  useEventsListQuery,
  useSequenceListQuery,
  useTimeseriesListQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';
import { EventInfo } from '../../Info';
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

interface Props {
  eventItem: ResourceItem;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const EventDetails: FC<Props> = ({
  eventItem,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const {
    isLoading: isParentEventLoading,
    data: event,
    isFetched: isEventFetched,
  } = useEventsByIdsQuery([{ id: eventItem.id }]);

  const parentEvent = event?.[0];

  const assetIds: number[] = parentEvent?.assetIds || [];
  const isQueryEnabled = assetIds.length > 0;

  const { data: assets = [], isLoading: isAssetsLoading } = useAssetsByIdQuery(
    assetIds.map((id) => ({ id })),
    { enabled: isEventFetched && !!assetIds && assetIds.length > 0 }
  );

  const {
    hasNextPage: hasEventNextPage,
    fetchNextPage: hasEventFetchNextPage,
    isLoading: isEventsLoading,
    data: events,
  } = useEventsListQuery({ filter: { assetIds } }, { enabled: isQueryEnabled });

  const {
    hasNextPage: hasTimeseriesNextPage,
    fetchNextPage: hasTimeseriesFetchNextPage,
    isLoading: isTimeseriesLoading,
    data: timeseries,
  } = useTimeseriesListQuery(
    { filter: { assetIds } },
    { enabled: isQueryEnabled }
  );

  const {
    hasNextPage: hasDocumentsNextPage,
    fetchNextPage: hasDocumentsFetchNextPage,
    isLoading: isDocumentsLoading,
    results: relatedDocuments = [],
  } = useDocumentSearchResultQuery(
    {
      filter: {
        assetSubtreeIds: assetIds.map((value) => ({
          value,
        })),
      },
    },
    { enabled: isQueryEnabled }
  );

  const {
    hasNextPage: hasSequencesNextPage,
    fetchNextPage: hasSequencesFetchNextPage,
    isLoading: isSequencesLoading,
    data: sequences = [],
  } = useSequenceListQuery(
    {
      filter: {
        assetIds,
      },
    },
    { enabled: isQueryEnabled }
  );

  return (
    <ResourceDetailsTemplate
      title={eventItem && eventItem.type ? eventItem.type : ''}
      icon="Events"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <StyledCollapse accordion ghost defaultActiveKey="event-details">
        <Collapse.Panel key="event-details" header={<h4>{DETAILS}</h4>}>
          {parentEvent ? (
            <EventInfo event={parentEvent} />
          ) : (
            <Title level={5}>{NO_DETAILS_AVAILABLE}</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel key="event-asset-detail" header={<h4>{ASSETS}</h4>}>
          <AssetDetailsTable
            id="asset-resource-event-detail-table"
            data={assets}
            isDataLoading={isParentEventLoading || isAssetsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="event-timeseries-detail"
          header={<h4>{TIME_SERIES}</h4>}
        >
          <TimeseriesDetailsTable
            id="timeseries-resource-event-detail-table"
            data={timeseries}
            hasNextPage={hasTimeseriesNextPage}
            fetchMore={hasTimeseriesFetchNextPage}
            isDataLoading={isParentEventLoading || isTimeseriesLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel key="event-documents-detail" header={<h4>{FILES}</h4>}>
          <FileDetailsTable
            id="documents-resource-event-detail-table"
            data={relatedDocuments}
            hasNextPage={hasDocumentsNextPage}
            fetchMore={hasDocumentsFetchNextPage}
            isDataLoading={isParentEventLoading || isDocumentsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel key="event-events-detail" header={<h4>{EVENTS}</h4>}>
          <EventDetailsTable
            id="event-resource-event-detail-table"
            data={events}
            hasNextPage={hasEventNextPage}
            fetchMore={hasEventFetchNextPage}
            isDataLoading={isParentEventLoading || isEventsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="event-sequence-detail"
          header={<h4>{SEQUENCES}</h4>}
        >
          <SequenceDetailsTable
            id="sequence-resource-event-detail-table"
            data={sequences}
            hasNextPage={hasSequencesNextPage}
            fetchMore={hasSequencesFetchNextPage}
            isDataLoading={isParentEventLoading || isSequencesLoading}
          />
        </Collapse.Panel>
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};
