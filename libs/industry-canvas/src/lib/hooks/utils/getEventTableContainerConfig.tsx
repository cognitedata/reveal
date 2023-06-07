import styled from 'styled-components';

import { TimeDisplay } from '@data-exploration/components';

import { createLink } from '@cognite/cdf-utilities';
import { Icon, Link } from '@cognite/cogs.js';
import { CogniteEvent, CogniteClient, Asset } from '@cognite/sdk';
import {
  ContainerType,
  TableContainerProps,
  TableItem,
} from '@cognite/unified-file-viewer';

export const getEventTableTitle = (event: CogniteEvent): string => {
  let title = '';
  if (event.type) {
    title += event.type;
    if (event.externalId) {
      title += ': ';
    }
  }
  if (event.externalId) {
    title += event.externalId;
  }
  return title;
};

const getEvent = async (
  client: CogniteClient,
  eventId: number
): Promise<CogniteEvent> => {
  const events = await client.events.retrieve([{ id: eventId }]);
  if (events.length !== 1) {
    throw Error('There must be exactly one unique event for an event id');
  }
  return events[0];
};

const EventAssets = ({
  assets,
  eventId,
}: {
  assets: Asset[];
  eventId: number;
}): JSX.Element => {
  if (assets.length === 0) {
    return <p />;
  }
  const assetsLink = createLink(
    assets.length === 1
      ? `/explore/asset/${assets[0].id}`
      : `/explore/events/${eventId}/asset`
  );
  const assetsLinkText =
    assets.length === 1 ? assets[0].name : `${assets.length} assets`;
  return (
    <Link
      href={assetsLink}
      size="small"
      target="_blank"
      className="table-item-value"
    >
      {assetsLinkText}
    </Link>
  );
};

const getEventTableItems = async (
  client: CogniteClient,
  event: CogniteEvent
): Promise<TableItem[]> => {
  const assets =
    event.assetIds !== undefined && event.assetIds.length > 0
      ? await client.assets.retrieve(event.assetIds.map((id) => ({ id })))
      : [];
  return [
    { label: 'Type', value: event.type },
    { label: 'Sub type', value: event.subtype },
    { label: 'Description', value: event.description },
    { label: 'ID', value: event.id },
    { label: 'External ID', value: event.externalId },
    { label: 'Start time', value: <TimeDisplay value={event.startTime} /> },
    { label: 'End time', value: <TimeDisplay value={event.endTime} /> },
    {
      label: 'Linked asset(s)',
      value: <EventAssets assets={assets} eventId={event.id} />,
    },
    { label: 'Created at', value: <TimeDisplay value={event.createdTime} /> },
    {
      label: 'Updated at',
      value: <TimeDisplay value={event.lastUpdatedTime} />,
    },
    { label: 'Source', value: event.source },
  ];
};

const getEventTableContainerConfig = async (
  client: CogniteClient,
  props: Omit<TableContainerProps, 'type' | 'items'>,
  { eventId }: { eventId: number }
): Promise<TableContainerProps> => {
  try {
    const event = await getEvent(client, eventId);
    return {
      ...props,
      title: (
        <TitleWrapper>
          <ColoredIcon type="Events" /> {}
          {getEventTableTitle(event)}
        </TitleWrapper>
      ),
      type: ContainerType.TABLE,
      items: await getEventTableItems(client, event),
      isLoading: false,
    };
  } catch (error) {
    return {
      ...props,
      type: ContainerType.TABLE,
      items: [],
      isLoading: false,
      isError: true,
    };
  }
};

const ColoredIcon = styled(Icon)`
  color: #c945db;
  position: relative;
  margin-right: 8px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export default getEventTableContainerConfig;
