import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';

import React from 'react';

import NdsEventsColumn from './NdsEventsColumn';
import NptEventsColumn from './NptEventsColumn';

export type Props = {
  scaleBlocks: number[];
  nptEvents: NptInternal[];
  ndsEvents: NdsInternal[];
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
