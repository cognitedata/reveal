import { NptInternal } from 'domain/wells/npt/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';

import { NPT_COLUMN_TITLE } from './constants';
import {
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnBody,
  ScaleLine,
  DepthMeasurementScale,
  LastScaleBlock,
  EmptyStateWrapper,
} from './elements';
import NptEventsBadge from './NptEventsBadge';

export type Props = {
  scaleBlocks: number[];
  events: NptInternal[];
  isEventsLoading?: boolean;
  scaleLineGap?: number;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NPT events data';
export const LOADING_TEXT = 'Loading';

const NptEventsColumn: React.FC<Props> = ({
  scaleBlocks,
  events,
  isEventsLoading,
  scaleLineGap,
}: Props) => {
  const blockElements = useMemo(() => {
    const lastEvents = events.filter(
      (event) =>
        event.measuredDepth &&
        event.measuredDepth?.value >= scaleBlocks[scaleBlocks.length - 1]
    );

    return (
      <>
        {scaleBlocks.map((row, index) => {
          const blockEvents = events.filter(
            (event) =>
              event.measuredDepth &&
              event.measuredDepth?.value < row &&
              (!index || event.measuredDepth.value >= scaleBlocks[index - 1])
          );

          return (
            <ScaleLine gap={scaleLineGap} key={row}>
              {!isEmpty(blockEvents) ? (
                <NptEventsBadge events={blockEvents} />
              ) : null}
            </ScaleLine>
          );
        })}

        {!isEmpty(lastEvents) ? (
          <LastScaleBlock>
            <NptEventsBadge events={lastEvents} />
          </LastScaleBlock>
        ) : null}
      </>
    );
  }, [scaleBlocks, events]);

  return (
    <BodyColumn width={150}>
      <BodyColumnHeaderWrapper>
        <BodyColumnMainHeader>{NPT_COLUMN_TITLE}</BodyColumnMainHeader>
      </BodyColumnHeaderWrapper>
      <BodyColumnBody>
        {(isEventsLoading || isEmpty(events)) && (
          <EmptyStateWrapper>
            <EmptyState
              isLoading={isEventsLoading}
              loadingSubtitle={isEventsLoading ? LOADING_TEXT : ''}
              emptySubtitle={EMPTY_STATE_TEXT}
            />
          </EmptyStateWrapper>
        )}
        {!isEventsLoading && !isEmpty(events) && (
          <DepthMeasurementScale>{blockElements}</DepthMeasurementScale>
        )}
      </BodyColumnBody>
    </BodyColumn>
  );
};

export default NptEventsColumn;
