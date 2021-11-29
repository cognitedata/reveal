import React from 'react';

import groupBy from 'lodash/groupBy';

import { Dropdown } from '@cognite/cogs.js';

import { NPTEvent } from 'modules/wellSearch/types';

import {
  EventsCountBadge,
  EventsCountBadgeWrapper,
  EventsCodesWrapper,
  EventsCodesHeader,
  EventsCodeRow,
  EventsCodeName,
  EventsCodeCount,
} from './elements';

export type Props = {
  events: NPTEvent[];
  totalEventsCount: number;
};

const MIN_SIZE_PERCENTAGE = 70;

const EventsBadge: React.FC<Props> = ({ events, totalEventsCount }: Props) => {
  const groupedEvents = groupBy(events, 'nptCode');

  return (
    <Dropdown
      placement="left-start"
      openOnHover
      appendTo={document.body}
      content={
        <EventsCodesWrapper>
          <EventsCodesHeader>NPT events codes</EventsCodesHeader>
          {Object.keys(groupedEvents).map((code) => (
            <EventsCodeRow key={code}>
              <EventsCodeName>{code}</EventsCodeName>
              <EventsCodeCount>{groupedEvents[code].length}</EventsCodeCount>
            </EventsCodeRow>
          ))}
        </EventsCodesWrapper>
      }
    >
      <EventsCountBadgeWrapper>
        <EventsCountBadge
          size={
            (events.length / totalEventsCount) * (100 - MIN_SIZE_PERCENTAGE) +
            MIN_SIZE_PERCENTAGE
          }
        >
          <span>{events.length}</span>
        </EventsCountBadge>
      </EventsCountBadgeWrapper>
    </Dropdown>
  );
};

export default EventsBadge;
