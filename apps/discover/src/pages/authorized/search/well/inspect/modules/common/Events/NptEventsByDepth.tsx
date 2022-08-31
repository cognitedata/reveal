import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

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
  events: NptInternalWithTvd[];
  isLoading?: boolean;
  emptySubtitle?: string;
  depthMeasurementType?: DepthMeasurementUnit;
  renderBlockEvents: (blockEvents: NptInternalWithTvd[]) => JSX.Element | null;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NPT events data';
export const LOADING_TEXT = 'Loading';

export const NptEventsByDepth: React.FC<Props> = React.memo(
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
            const blockEvents = events.filter(
              ({ measuredDepth, trueVerticalDepth }) => {
                const eventDepth = isMdScale
                  ? measuredDepth
                  : trueVerticalDepth;

                return (
                  eventDepth &&
                  eventDepth.value < depth &&
                  (!index || eventDepth.value >= scaleBlocks[index - 1])
                );
              }
            );

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
