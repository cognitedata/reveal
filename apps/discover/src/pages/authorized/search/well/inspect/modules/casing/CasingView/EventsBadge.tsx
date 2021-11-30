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
};

const MIN_SIZE_PERCENTAGE = 70;
const MAX_SIZE_PERCENTAGE = 100;

const EventsBadge: React.FC<Props> = ({ events }: Props) => {
  const groupedEvents = groupBy(events, 'nptCode');

  let badgeSize = MAX_SIZE_PERCENTAGE;

  if (events.length < 6) {
    badgeSize = MIN_SIZE_PERCENTAGE;
  } else if (events.length < 11) {
    badgeSize = MIN_SIZE_PERCENTAGE + 15;
  }

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
        <EventsCountBadge size={badgeSize}>
          <span>{events.length}</span>
        </EventsCountBadge>
      </EventsCountBadgeWrapper>
    </Dropdown>
  );
};

export default EventsBadge;
