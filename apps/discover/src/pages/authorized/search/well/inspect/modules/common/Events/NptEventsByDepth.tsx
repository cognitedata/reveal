import { NptInternal } from 'domain/wells/npt/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';

import {
  ScaleLine,
  DepthMeasurementScale,
  EmptyStateWrapper,
} from './elements';

export type Props = {
  scaleBlocks: number[];
  events: NptInternal[];
  isLoading?: boolean;
  renderBlockEvents: (blockEvents: NptInternal[]) => JSX.Element | null;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NPT events data';
export const LOADING_TEXT = 'Loading';

export const NptEventsByDepth: React.FC<Props> = ({
  scaleBlocks,
  events,
  isLoading,
  renderBlockEvents,
}: Props) => {
  const blockElements = useMemo(() => {
    return (
      <>
        {scaleBlocks.map((depth, index) => {
          const blockEvents = events.filter(
            (event) =>
              event.measuredDepth &&
              event.measuredDepth?.value < depth &&
              (!index || event.measuredDepth.value >= scaleBlocks[index - 1])
          );

          return (
            <ScaleLine key={depth}>{renderBlockEvents(blockEvents)}</ScaleLine>
          );
        })}
      </>
    );
  }, [scaleBlocks, events, renderBlockEvents]);

  if (isLoading || isEmpty(events)) {
    return (
      <EmptyStateWrapper>
        <EmptyState
          isLoading={isLoading}
          loadingSubtitle={isLoading ? LOADING_TEXT : ''}
          emptySubtitle={EMPTY_STATE_TEXT}
        />
      </EmptyStateWrapper>
    );
  }

  return <DepthMeasurementScale>{blockElements}</DepthMeasurementScale>;
};
