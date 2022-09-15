import { useState } from 'react';

import { CollapseIconButton } from 'components/Buttons';
import { ScatterView } from 'components/ScatterViewV2';
import { DepthMeasurementUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { FlexRowFullWidth } from 'styles/layout';

import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../WellboreStickChart/constants';
import { DetailCardBlock } from '../DetailCard';

import {
  CollapseIconButtonWrapper,
  ExpandedViewWrapper,
  ScattersWrapper,
} from './elements';

const SCATTERS_PER_LINE = 29;
const LINE_HEIGHT = 22;

export interface EventsScatterViewExpandedProps<T> {
  title: string;
  events: T[];
  colorAccessor?: keyof T;
  scaleBlockRange: [number, number];
  depthMeasurementType?: DepthMeasurementUnit;
  onCollapse: () => void;
  renderEventDetailCard: (selectedEvent: T) => JSX.Element;
}

export const EventsScatterViewExpanded = <T extends object>({
  title,
  events,
  colorAccessor,
  scaleBlockRange,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  onCollapse,
  renderEventDetailCard,
}: EventsScatterViewExpandedProps<T>) => {
  const { data: depthUnit } = useUserPreferencesMeasurement();

  const [selectedEvent, setSelectedEvent] = useState<T>();
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>();

  const numberOfScatterLines = Math.ceil(events.length / SCATTERS_PER_LINE);
  const scattersHeight = numberOfScatterLines * LINE_HEIGHT;

  const handleClickScatter = (event: T, index: number) => {
    setSelectedEvent(event);
    setSelectedEventIndex(index);
  };

  const subtitle = `${depthMeasurementType} (${depthUnit}) ${scaleBlockRange.join(
    '-'
  )}`;

  return (
    <ExpandedViewWrapper>
      <FlexRowFullWidth>
        <DetailCardBlock title={title} value={subtitle} />
        <CollapseIconButtonWrapper>
          <CollapseIconButton type="ghost" onClick={onCollapse} />
        </CollapseIconButtonWrapper>
      </FlexRowFullWidth>

      <FlexRowFullWidth>
        <ScattersWrapper height={scattersHeight}>
          <ScatterView<T>
            data={events}
            colorAccessor={colorAccessor}
            highlightScatterIndex={selectedEventIndex}
            onClickScatter={handleClickScatter}
          />
        </ScattersWrapper>
      </FlexRowFullWidth>

      {selectedEvent && renderEventDetailCard(selectedEvent)}
    </ExpandedViewWrapper>
  );
};
