import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import * as React from 'react';

import { DepthMeasurementUnit } from 'constants/units';

import { EventsScatterViewExpanded } from '../../../components/EventsScatterViewExpanded';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';

import { NdsEventDetailCardContent } from './NdsEventDetailCardContent';

export interface NdsEventsExpandedViewProps {
  events: NdsInternalWithTvd[];
  scaleBlockRange: [number, number];
  depthMeasurementType?: DepthMeasurementUnit;
  onCollapse: () => void;
}

export const NdsEventsExpandedView: React.FC<NdsEventsExpandedViewProps> = ({
  events,
  scaleBlockRange,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  onCollapse,
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
    />
  );
};
