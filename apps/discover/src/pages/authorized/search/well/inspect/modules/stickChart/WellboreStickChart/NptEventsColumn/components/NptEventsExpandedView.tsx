import {
  NptCodeDefinitionType,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';

import * as React from 'react';

import { BooleanMap } from 'utils/booleanMap';

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
  highlightedEventsMap?: BooleanMap;
}

export const NptEventsExpandedView: React.FC<NptEventsExpandedViewProps> = ({
  events,
  nptCodeDefinitions,
  scaleBlockRange,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  onCollapse,
  highlightedEventsMap,
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
      highlightedEventsMap={highlightedEventsMap}
    />
  );
};
