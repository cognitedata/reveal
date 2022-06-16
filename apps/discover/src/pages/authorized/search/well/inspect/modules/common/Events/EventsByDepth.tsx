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
  scaleLineGap?: number;
};

const EventsByDepth: React.FC<Props> = ({
  scaleBlocks,
  nptEvents = [],
  ndsEvents = [],
  isNptEventsLoading,
  isNdsEventsLoading,
  scaleLineGap,
}: Props) => {
  return (
    <>
      <NptEventsColumn
        scaleBlocks={scaleBlocks}
        events={nptEvents}
        isEventsLoading={isNptEventsLoading}
        scaleLineGap={scaleLineGap}
      />
      <NdsEventsColumn
        scaleBlocks={scaleBlocks}
        events={ndsEvents}
        isEventsLoading={isNdsEventsLoading}
        scaleLineGap={scaleLineGap}
      />
    </>
  );
};

export default EventsByDepth;
