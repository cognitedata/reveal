import { Body, Title } from '@cognite/cogs.js';
import { CogniteEvent, Timestamp } from '@cognite/sdk';
import dayjs from 'dayjs';
import IconContainer from 'components/icons';

import ShareButton from '../ShareButton';

import EventDownloadButton from './EventDownloadButton';
import {
  Actions,
  SidebarWrapper,
  Header,
  Content,
  Metadata,
  MetadataItem,
} from './elements';

const formatDate = (date?: Timestamp) => {
  if (!date) {
    return 'Ongoing';
  }
  return dayjs(date).format('LLL');
};

export type EventSidebarProps = {
  event: CogniteEvent;
};

const EventSidebar = ({ event }: EventSidebarProps) => {
  return (
    <SidebarWrapper>
      <Header>
        <IconContainer type="Events" />
        <div>
          <Title level={5} className="event-sidebar--type">
            {event.type}
          </Title>
          <Body className="event-sidebar--subtype">{event.subtype}</Body>
        </div>
      </Header>

      <Content>
        <div className="event-sidebar--content-item">
          <Body strong className="event-sidebar--title">
            Start / End Time
          </Body>
          <Body className="event-sidebar--value">
            {formatDate(event.startTime)}
          </Body>
          <Body className="event-sidebar--value">
            {formatDate(event.endTime)}
          </Body>
        </div>
        <div className="event-sidebar--content-item">
          <Body strong className="event-sidebar--title">
            Description
          </Body>
          <Body className="event-sidebar--value">
            {event.description || '-'}
          </Body>
        </div>
      </Content>

      <Actions>
        <ShareButton size="default" className="event-sidebar--share-btn" />
        <EventDownloadButton event={event} />
      </Actions>
      <Metadata>
        <MetadataItem>
          <Body level={2} strong className="event-sidebar--details">
            Details
          </Body>
        </MetadataItem>
        {Object.keys(event.metadata || {}).map((key) => (
          <MetadataItem key={key}>
            <Body level={2} strong>
              {key}
            </Body>
            <Body level={3}>{event.metadata?.[key]}</Body>
          </MetadataItem>
        ))}
      </Metadata>
    </SidebarWrapper>
  );
};

export default EventSidebar;
