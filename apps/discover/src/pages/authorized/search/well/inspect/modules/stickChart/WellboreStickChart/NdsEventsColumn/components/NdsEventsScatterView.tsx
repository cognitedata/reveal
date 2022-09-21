import { sortNdsEventsByOccurence } from 'domain/wells/nds/internal/transformers/sortNdsEventsByOccurence';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import isEqual from 'lodash/isEqual';

import { Dropdown } from '@cognite/cogs.js';

import { ExpandCollapseIconButton } from 'components/Buttons';
import { ScatterView } from 'components/ScatterViewV2';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';

import { NdsEventDetailCard } from './NdsEventDetailCard';
import { NdsEventsExpandedView } from './NdsEventsExpandedView';

interface Props {
  events: NdsInternalWithTvd[];
  depthMeasurementType?: DepthMeasurementUnit;
  scaleBlockRange: [number, number];
  expandedScaleBlock?: [number, number];
  onExpandOverflowEvents: (
    scaleBlockRange: [number, number] | undefined
  ) => void;
}

export const NdsEventsScatterView: React.FC<Props> = ({
  events,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  scaleBlockRange,
  expandedScaleBlock,
  onExpandOverflowEvents,
}) => {
  const sortedEvents = useDeepMemo(
    () => sortNdsEventsByOccurence(events),
    [events]
  );

  const collapseExpandedView = () => {
    onExpandOverflowEvents(undefined);
  };

  const renderScatterDetails = (event: NdsInternalWithTvd) => (
    <NdsEventDetailCard
      event={event}
      depthMeasurementType={depthMeasurementType}
    />
  );

  const renderOverflowAction = (events: NdsInternalWithTvd[]) => {
    const isOverflowEventsExpanded = Boolean(
      expandedScaleBlock && isEqual(scaleBlockRange, expandedScaleBlock)
    );

    return (
      <Dropdown
        placement="right-start"
        visible={isOverflowEventsExpanded}
        content={
          <NdsEventsExpandedView
            events={events}
            scaleBlockRange={scaleBlockRange}
            depthMeasurementType={depthMeasurementType}
            onCollapse={collapseExpandedView}
          />
        }
      >
        <ExpandCollapseIconButton
          tooltip=""
          expanded={isOverflowEventsExpanded}
          onChange={(expanded) => {
            onExpandOverflowEvents(expanded ? scaleBlockRange : undefined);
          }}
        />
      </Dropdown>
    );
  };

  return (
    <ScatterView<NdsInternalWithTvd>
      data={sortedEvents}
      colorAccessor="ndsCodeColor"
      onClickScatter={collapseExpandedView}
      renderScatterDetails={renderScatterDetails}
      scatterDetailsPlacement="top"
      renderOverflowAction={renderOverflowAction}
    />
  );
};
