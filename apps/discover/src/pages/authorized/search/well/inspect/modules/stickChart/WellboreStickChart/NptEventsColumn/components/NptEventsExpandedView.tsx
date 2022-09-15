import {
  NptCodeDefinitionType,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';

import * as React from 'react';

import { DepthMeasurementUnit } from 'constants/units';

import { EventsScatterViewExpanded } from '../../../components/EventsScatterViewExpanded';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';

import { NptEventDetailCardContent } from './NptEventDetailCardContent';

export interface NptEventsExpandedViewProps {
  events: NptInternalWithTvd[];
  nptCodeDefinitions: NptCodeDefinitionType;
  scaleBlockRange: [number, number];
  depthMeasurementType?: DepthMeasurementUnit;
  onCollapse: () => void;
}

export const NptEventsExpandedView: React.FC<NptEventsExpandedViewProps> = ({
  events,
  nptCodeDefinitions,
  scaleBlockRange,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  onCollapse,
}) => {
  return (
    <EventsScatterViewExpanded<NptInternalWithTvd>
      title="NPT Events"
      events={events}
      colorAccessor="nptCodeColor"
      scaleBlockRange={scaleBlockRange}
      depthMeasurementType={depthMeasurementType}
      onCollapse={onCollapse}
      renderEventDetailCard={(selectedEvent) => (
        <NptEventDetailCardContent
          event={selectedEvent}
          nptCodeDefinitions={nptCodeDefinitions}
          depthMeasurementType={depthMeasurementType}
        />
      )}
    />
  );
};
