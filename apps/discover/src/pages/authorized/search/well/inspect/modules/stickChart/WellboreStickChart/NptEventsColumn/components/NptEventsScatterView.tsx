import { sortNptEventsByOccurence } from 'domain/wells/npt/internal/transformers/sortNptEventsByOccurence';
import {
  NptCodeDefinitionType,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';

import isEqual from 'lodash/isEqual';

import { Dropdown } from '@cognite/cogs.js';

import { ExpandCollapseIconButton } from 'components/Buttons';
import { ScatterView } from 'components/ScatterViewV2';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useHighlightedNptMap } from 'modules/wellInspect/selectors';

import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../../constants';

import { NptEventDetailCard } from './NptEventDetailCard';
import { NptEventsExpandedView } from './NptEventsExpandedView';

interface Props {
  events: NptInternalWithTvd[];
  nptCodeDefinitions: NptCodeDefinitionType;
  depthMeasurementType?: DepthMeasurementUnit;
  scaleBlockRange: [number, number];
  expandedScaleBlock?: [number, number];
  onExpandOverflowEvents: (
    scaleBlockRange: [number, number] | undefined
  ) => void;
}

export const NptEventsScatterView: React.FC<Props> = ({
  events,
  nptCodeDefinitions,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
  scaleBlockRange,
  expandedScaleBlock,
  onExpandOverflowEvents,
}) => {
  const highlightedNptMap = useHighlightedNptMap();

  const sortedEvents = useDeepMemo(
    () => sortNptEventsByOccurence(events),
    [events]
  );

  const collapseExpandedView = () => {
    onExpandOverflowEvents(undefined);
  };

  const renderScatterDetails = (event: NptInternalWithTvd) => (
    <NptEventDetailCard
      event={event}
      nptCodeDefinitions={nptCodeDefinitions}
      depthMeasurementType={depthMeasurementType}
    />
  );

  const renderOverflowAction = (events: NptInternalWithTvd[]) => {
    const isOverflowEventsExpanded = Boolean(
      expandedScaleBlock && isEqual(scaleBlockRange, expandedScaleBlock)
    );

    return (
      <Dropdown
        placement="right-start"
        visible={isOverflowEventsExpanded}
        content={
          <NptEventsExpandedView
            events={events}
            nptCodeDefinitions={nptCodeDefinitions}
            scaleBlockRange={scaleBlockRange}
            depthMeasurementType={depthMeasurementType}
            onCollapse={collapseExpandedView}
            highlightedEventsMap={highlightedNptMap}
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
    <ScatterView<NptInternalWithTvd>
      data={sortedEvents}
      colorAccessor="nptCodeColor"
      onClickScatter={collapseExpandedView}
      renderScatterDetails={renderScatterDetails}
      scatterDetailsPlacement="top"
      renderOverflowAction={renderOverflowAction}
      highlightedEventsMap={highlightedNptMap}
    />
  );
};
