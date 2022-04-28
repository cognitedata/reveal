import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/emptyState';
import { NDSEvent } from 'modules/wellSearch/types';

import { NDS_COLUMN_TITLE } from './constants';
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
import NdsEventsBadge from './NdsEventsBadge';

export type Props = {
  scaleBlocks: number[];
  events: NDSEvent[];
  isEventsLoading?: boolean;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NDS events data';
export const LOADING_TEXT = 'Loading';

const NdsEventsColumn: React.FC<Props> = ({
  scaleBlocks,
  events,
  isEventsLoading,
}: Props) => {
  const blockElements = useMemo(() => {
    const lastEvents = events.filter(
      (event) =>
        event.metadata &&
        Number(event.metadata?.md_hole_start) >=
          scaleBlocks[scaleBlocks.length - 1]
    );

    return (
      <>
        {scaleBlocks.map((row, index) => {
          const blockEvents = events.filter(
            (event) =>
              event.metadata &&
              Number(event.metadata?.md_hole_start) < row &&
              (!index ||
                Number(event.metadata?.md_hole_start) >= scaleBlocks[index - 1])
          );

          return (
            <ScaleLine key={row}>
              {!isEmpty(blockEvents) ? (
                <NdsEventsBadge events={blockEvents} />
              ) : null}
            </ScaleLine>
          );
        })}

        {!isEmpty(lastEvents) ? (
          <LastScaleBlock>
            <NdsEventsBadge events={lastEvents} />
          </LastScaleBlock>
        ) : null}
      </>
    );
  }, [scaleBlocks, events]);

  return (
    <BodyColumn width={150}>
      <BodyColumnHeaderWrapper>
        <BodyColumnMainHeader>{NDS_COLUMN_TITLE}</BodyColumnMainHeader>
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

export default NdsEventsColumn;
