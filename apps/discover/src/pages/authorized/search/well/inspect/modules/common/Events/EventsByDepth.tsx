import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';

import React from 'react';

import { FlexRow } from 'styles/layout';

import { EventTabs } from '../../measurements/wellCentricView/constants';

import NdsEventsColumn from './NdsEventsColumn';
import NptEventsColumn from './NptEventsColumn';

export type Props = {
  scaleBlocks: number[];
  nptEvents: NptInternal[];
  ndsEvents: NdsInternal[];
  isNptEventsLoading?: boolean;
  isNdsEventsLoading?: boolean;
  view?: EventTabs;
};

const EventsByDepth: React.FC<Props> = ({
  scaleBlocks,
  nptEvents = [],
  ndsEvents = [],
  isNptEventsLoading,
  isNdsEventsLoading,
  view,
}: Props) => {
  return (
    <FlexRow>
      <NptEventsColumn
        scaleBlocks={scaleBlocks}
        events={nptEvents}
        isEventsLoading={isNptEventsLoading}
        view={view}
      />
      <NdsEventsColumn
        scaleBlocks={scaleBlocks}
        events={ndsEvents}
        isEventsLoading={isNdsEventsLoading}
        view={view}
      />
    </FlexRow>
  );
};

export default EventsByDepth;
