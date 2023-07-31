import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import * as React from 'react';

import { BooleanMap } from 'utils/booleanMap';

import { DepthMeasurementUnit } from 'constants/units';

import { EventsScatterViewExpanded } from '../../../components/EventsScatterViewExpanded';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';

import { NdsEventDetailCardContent } from './NdsEventDetailCardContent';

export interface NdsEventsExpandedViewProps {
  events: NdsInternalWithTvd[];
  scaleBlockRange: [number, number];
  depthMeasurementType?: DepthMeasurementUnit;
  onCollapse: () => void;
  highlightedEventsMap?: BooleanMap;
}

export const NdsEventsExpandedView: React.FC<NdsEventsExpandedViewProps> = ({
  events,
  scaleBlockRange,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  onCollapse,
  highlightedEventsMap,
}) => {
  return (
    <EventsScatterViewExpanded<NdsInternalWithTvd>
      title="NDS Events"
      events={events}
      colorAccessor="ndsCodeColor"
      scaleBlockRange={scaleBlockRange}
      depthMeasurementType={depthMeasurementType}
      onCollapse={onCollapse}
      renderEventDetailCard={(selectedEvent) => (
        <NdsEventDetailCardContent
          event={selectedEvent}
          depthMeasurementType={depthMeasurementType}
        />
      )}
      highlightedEventsMap={highlightedEventsMap}
    />
  );
};
