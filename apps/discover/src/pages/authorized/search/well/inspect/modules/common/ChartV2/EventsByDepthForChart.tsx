import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';

import * as React from 'react';

import { EventTabs } from '../../measurements/wellCentricView/constants';

import { NdsEventsColumnForChart } from './NdsEventsColumnForChart';
import { NptEventsColumnForChart } from './NptEventsColumnForChart';

export type Props = {
  scaleBlocks: number[];
  nptEvents: NptInternal[];
  ndsEvents: NdsInternal[];
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
  scaleLineGap?: number;
  view?: EventTabs;
};

const EventsByDepthForChart: React.FC<Props> = ({
  scaleBlocks,
  nptEvents = [],
  ndsEvents = [],
  isNptEventsLoading,
  isNdsEventsLoading,
  scaleLineGap,
  view,
}: Props) => {
  return (
    <>
      <NptEventsColumnForChart
        scaleBlocks={scaleBlocks}
        events={nptEvents}
        isEventsLoading={isNptEventsLoading}
        scaleLineGap={scaleLineGap}
        view={view}
      />
      <NdsEventsColumnForChart
        scaleBlocks={scaleBlocks}
        events={ndsEvents}
        isEventsLoading={isNdsEventsLoading}
        scaleLineGap={scaleLineGap}
        view={view}
      />
    </>
  );
};

export default EventsByDepthForChart;
