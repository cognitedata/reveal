import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import React from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepCallback } from 'hooks/useDeep';

import {
  ScaleLine,
  DepthMeasurementScale,
  EmptyStateWrapper,
} from './elements';

export type Props = {
  scaleBlocks: number[];
  events: NdsInternalWithTvd[];
  isLoading?: boolean;
  emptySubtitle?: string;
  depthMeasurementType?: DepthMeasurementUnit;
  renderBlockEvents: (blockEvents: NdsInternalWithTvd[]) => JSX.Element | null;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NDS events data';
export const LOADING_TEXT = 'Loading';

export const NdsEventsByDepth: React.FC<Props> = React.memo(
  ({
    scaleBlocks,
    events,
    isLoading,
    emptySubtitle = EMPTY_STATE_TEXT,
    depthMeasurementType = DepthMeasurementUnit.MD,
    renderBlockEvents,
  }: Props) => {
    const isMdScale = depthMeasurementType === DepthMeasurementUnit.MD;

    const getBlockElements = useDeepCallback(() => {
      return (
        <>
          {scaleBlocks.map((depth, index) => {
            const blockEvents = events.filter(({ holeStart, holeStartTvd }) => {
              const holeStartDepth = isMdScale ? holeStart : holeStartTvd;

              return (
                holeStartDepth &&
                holeStartDepth.value < depth &&
                (!index || holeStartDepth.value >= scaleBlocks[index - 1])
              );
            });

            return (
              <ScaleLine key={depth}>
                {renderBlockEvents(blockEvents)}
              </ScaleLine>
            );
          })}
        </>
      );
    }, [scaleBlocks, events, depthMeasurementType, renderBlockEvents]);

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

    return <DepthMeasurementScale>{getBlockElements()}</DepthMeasurementScale>;
  }
);
