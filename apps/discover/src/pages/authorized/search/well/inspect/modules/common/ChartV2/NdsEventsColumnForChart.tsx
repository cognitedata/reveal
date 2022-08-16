import { NdsInternal } from 'domain/wells/nds/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';

import { NDS_COLUMN_TITLE } from '../Events/constants';
import {
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnBody,
  EmptyStateWrapper,
} from '../Events/elements';
import NdsEventsBadge from '../Events/NdsEventsBadge';
import { NdsEventsScatterView } from '../Events/NdsEventsScatterView';
import { EventsColumnView } from '../Events/types';

import { DepthMeasurementScaleForChart, ScaleLineForChart } from './elements';

export type Props = {
  scaleBlocks: number[];
  events: NdsInternal[];
  isEventsLoading?: boolean;
  scaleLineGap?: number;
  view?: EventsColumnView;
};

export const EMPTY_STATE_TEXT =
  'This wellbore has no NDS events data on this depth';
export const LOADING_TEXT = 'Loading';

export const NdsEventsColumnForChart: React.FC<Props> = ({
  scaleBlocks,
  events,
  isEventsLoading,
  scaleLineGap,
  view,
}: Props) => {
  const blockElements = useMemo(() => {
    return (
      <>
        {scaleBlocks.map((row, index) => {
          const blockEvents = events.filter(
            ({ holeStart }) =>
              holeStart &&
              holeStart.value >= row &&
              holeStart.value < scaleBlocks[index + 1]
          );

          const renderContent = () => {
            if (isEmpty(blockEvents)) {
              return null;
            }

            if (view === EventsColumnView.Scatter) {
              return <NdsEventsScatterView events={blockEvents} />;
            }

            return <NdsEventsBadge events={blockEvents} />;
          };

          if (index === scaleBlocks.length - 1) {
            return null;
          }

          return (
            <ScaleLineForChart key={row} gap={scaleLineGap}>
              {renderContent()}
            </ScaleLineForChart>
          );
        })}
      </>
    );
  }, [scaleBlocks, events, view]);

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
          <DepthMeasurementScaleForChart>
            {blockElements}
          </DepthMeasurementScaleForChart>
        )}
      </BodyColumnBody>
    </BodyColumn>
  );
};
