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
  renderBlockEvents: (
    blockEvents: NdsInternalWithTvd[],
    scaleBlockRange: [number, number]
  ) => JSX.Element | null;
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
            const blockEvents = events.filter(({ holeTop, holeTopTvd }) => {
              const holeTopDepth = isMdScale ? holeTop : holeTopTvd;

              return (
                holeTopDepth &&
                holeTopDepth.value < depth &&
                (!index || holeTopDepth.value >= scaleBlocks[index - 1])
              );
            });

            const scaleBlockRangeMin = index
              ? scaleBlocks[index - 1]
              : scaleBlocks[index];

            const scaleBlockRangeMax = scaleBlocks[index];

            return (
              <ScaleLine key={depth}>
                {renderBlockEvents(blockEvents, [
                  scaleBlockRangeMin,
                  scaleBlockRangeMax,
                ])}
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
