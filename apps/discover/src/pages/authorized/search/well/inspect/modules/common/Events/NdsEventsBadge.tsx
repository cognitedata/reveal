import { adaptNdsEventsToListView } from 'domain/wells/nds/internal/transformers/adaptNdsEventsToListView';
import { NdsInternal } from 'domain/wells/nds/internal/types';

import React, { useState } from 'react';

import { Dropdown } from '@cognite/cogs.js';

import { NDS_EVENT_CODES_TITLE } from './constants';
import {
  NdsEventsCountBadge,
  EventsCountBadgeWrapper,
  EventsCodesWrapper,
  EventsCodesHeader,
  EventsCodeRow,
  EventsCodeName,
  EventsCodeCount,
} from './elements';

export type Props = {
  events: NdsInternal[];
};

const MIN_SIZE_PERCENTAGE = 70;
const MAX_SIZE_PERCENTAGE = 100;

const NdsEventsBadge: React.FC<Props> = ({ events }: Props) => {
  /**
   * Visibility state of events badge hover content.
   *
   * Don't use the `openOnHover` prop in `Dropdown`.
   * When two badges are in their maximum size, the space between the badges gets almost none.
   * So, when moving the cursor towards the next badge across the centric line of the badges
   * does not let the previous badge content hide. [PP-2796]
   * Seems the hide event is not triggering itself (This is an issue with Tippy).
   *
   * In addition to the above issue,
   * When passed `openOnHover` prop and the user clicks on the badge, the content keeps opened
   * unless the user clicks again on the badge.
   *
   * Hence, handling the visibility state manually.
   */
  const [isVisible, setVisible] = useState<boolean>(false);

  const sortedEvents = adaptNdsEventsToListView(events);

  let badgeSize = MAX_SIZE_PERCENTAGE;

  if (events.length < 6) {
    badgeSize = MIN_SIZE_PERCENTAGE;
  } else if (events.length < 11) {
    badgeSize = MIN_SIZE_PERCENTAGE + 15;
  }

  return (
    <Dropdown
      placement="left-start"
      appendTo={document.body}
      visible={isVisible}
      onClickOutside={() => setVisible(false)}
      content={
        <EventsCodesWrapper>
          <EventsCodesHeader>{NDS_EVENT_CODES_TITLE}</EventsCodesHeader>
          {Object.keys(sortedEvents).map((code) => (
            <EventsCodeRow key={code}>
              <EventsCodeName>{code}</EventsCodeName>
              <EventsCodeCount>{sortedEvents[code]}</EventsCodeCount>
            </EventsCodeRow>
          ))}
        </EventsCodesWrapper>
      }
    >
      <EventsCountBadgeWrapper
        onClick={() => setVisible((previousState) => !previousState)}
      >
        <NdsEventsCountBadge size={badgeSize}>
          <span>{events.length}</span>
        </NdsEventsCountBadge>
      </EventsCountBadgeWrapper>
    </Dropdown>
  );
};

export default NdsEventsBadge;
