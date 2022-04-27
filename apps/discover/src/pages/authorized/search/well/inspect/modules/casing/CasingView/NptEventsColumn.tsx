import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/emptyState';
import { NPTEvent } from 'modules/wellSearch/types';

import { NDS_COLUMN_TITLE } from './constants';
import {
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnBody,
  ScaleLine,
  CasingScale,
  LastScaleBlock,
  EmptyStateWrapper,
} from './elements';
import NptEventsBadge from './NptEventsBadge';

export type Props = {
  scaleBlocks: number[];
  events: NPTEvent[];
  isEventsLoading?: boolean;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NPT events data';
export const LOADING_TEXT = 'Loading';

const NptEventsColumn: React.FC<Props> = ({
  scaleBlocks,
  events,
  isEventsLoading,
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
            <ScaleLine key={row}>
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
          <CasingScale>{blockElements}</CasingScale>
        )}
      </BodyColumnBody>
    </BodyColumn>
  );
};

export default NptEventsColumn;
