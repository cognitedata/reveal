import { NdsInternal } from 'domain/wells/nds/internal/types';

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
  events: NdsInternal[];
  isLoading?: boolean;
  emptySubtitle?: string;
  renderBlockEvents: (blockEvents: NdsInternal[]) => JSX.Element | null;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NDS events data';
export const LOADING_TEXT = 'Loading';

export const NdsEventsByDepth: React.FC<Props> = ({
  scaleBlocks,
  events,
  isLoading,
  emptySubtitle = EMPTY_STATE_TEXT,
  renderBlockEvents,
}: Props) => {
  const blockElements = useMemo(() => {
    return (
      <>
        {scaleBlocks.map((depth, index) => {
          const blockEvents = events.filter(
            ({ holeStart }) =>
              holeStart &&
              holeStart.value < depth &&
              (!index || holeStart.value >= scaleBlocks[index - 1])
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
          emptySubtitle={emptySubtitle}
          hideHeading
        />
      </EmptyStateWrapper>
    );
  }

  return <DepthMeasurementScale>{blockElements}</DepthMeasurementScale>;
};
