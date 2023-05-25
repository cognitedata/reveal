import { Collapse, Title } from '@cognite/cogs.js';

import { ResourceDetailsTemplate } from '@data-exploration/components';
import React, { FC } from 'react';

import {
  useAssetsByIdQuery,
  useEventsByIdsQuery,
  useEventsListQuery,
} from '@data-exploration-lib/domain-layer';
import { ResourceItem } from '@data-exploration-lib/core';
import { EventInfo } from '../../Info';
import { AssetDetailsTable, EventDetailsTable } from '../../DetailsTable';

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

  const { data: assets = [], isLoading: isAssetsLoading } = useAssetsByIdQuery(
    assetIds.map((id) => ({ id })),
    { enabled: isEventFetched && !!assetIds && assetIds.length > 0 }
  );

  const {
    hasNextPage: hasEventNextPage,
    fetchNextPage: hasEventFetchNextPage,
    isLoading: isEventsLoading,
    data: events,
  } = useEventsListQuery(
    { filter: { assetIds } },
    { enabled: assetIds.length > 0 }
  );

  return (
    <ResourceDetailsTemplate
      title={eventItem && eventItem.type ? eventItem.type : ''}
      icon="Events"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <Collapse accordion ghost defaultActiveKey="details">
        <Collapse.Panel key="event-details" header={<h4>Details</h4>}>
          {parentEvent ? (
            <EventInfo event={parentEvent} />
          ) : (
            <Title level={5}>No Details Available</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel key="event-asset-detail" header={<h4>Assets</h4>}>
          <AssetDetailsTable
            id="asset-resource-event-detail-table"
            data={assets}
            isDataLoading={isParentEventLoading || isAssetsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel key="event-events-detail" header={<h4>Events</h4>}>
          <EventDetailsTable
            id="event-resource-event-detail-table"
            data={events}
            hasNextPage={hasEventNextPage}
            fetchMore={hasEventFetchNextPage}
            isDataLoading={isParentEventLoading || isEventsLoading}
          />
        </Collapse.Panel>
      </Collapse>
    </ResourceDetailsTemplate>
  );
};
