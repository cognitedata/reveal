import React from 'react';

import { NDSEvent, NPTEvent } from 'modules/wellSearch/types';

import NdsEventsColumn from './NdsEventsColumn';
import NptEventsColumn from './NptEventsColumn';

export type Props = {
  scaleBlocks: number[];
  nptEvents: NPTEvent[];
  ndsEvents: NDSEvent[];
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
};

const EventsByDepth: React.FC<Props> = ({
  scaleBlocks,
  nptEvents = [],
  ndsEvents = [],
  isNptEventsLoading,
  isNdsEventsLoading,
}: Props) => {
  return (
    <>
      <NptEventsColumn
        scaleBlocks={scaleBlocks}
        events={nptEvents}
        isEventsLoading={isNptEventsLoading}
      />
      <NdsEventsColumn
        scaleBlocks={scaleBlocks}
        events={ndsEvents}
        isEventsLoading={isNdsEventsLoading}
      />
    </>
  );
};

export default EventsByDepth;
