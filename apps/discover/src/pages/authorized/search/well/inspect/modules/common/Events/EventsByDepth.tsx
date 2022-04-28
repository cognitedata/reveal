import React, { useMemo } from 'react';

import { NDSEvent, NPTEvent } from 'modules/wellSearch/types';

import NdsEventsColumn from './NdsEventsColumn';
import NptEventsColumn from './NptEventsColumn';
import { filterNdsByDepth, filterNptByDepth } from './utils';

export type Props = {
  scaleBlocks: number[];
  minDepth: number;
  maxDepth: number;
  nptEvents: NPTEvent[];
  ndsEvents: NDSEvent[];
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
};

const EventsByDepth: React.FC<Props> = ({
  scaleBlocks,
  minDepth,
  maxDepth,
  nptEvents = [],
  ndsEvents = [],
  isNptEventsLoading,
  isNdsEventsLoading,
}: Props) => {
  const validNptEvents = useMemo(
    () => filterNptByDepth(nptEvents, minDepth, maxDepth),
    [minDepth, maxDepth, nptEvents]
  );

  const validNdsEvents = useMemo(
    () => filterNdsByDepth(ndsEvents, minDepth, maxDepth),
    [minDepth, maxDepth, ndsEvents]
  );

  return (
    <>
      <NptEventsColumn
        scaleBlocks={scaleBlocks}
        events={validNptEvents}
        isEventsLoading={isNptEventsLoading}
      />
      <NdsEventsColumn
        scaleBlocks={scaleBlocks}
        events={validNdsEvents}
        isEventsLoading={isNdsEventsLoading}
      />
    </>
  );
};

export default EventsByDepth;
