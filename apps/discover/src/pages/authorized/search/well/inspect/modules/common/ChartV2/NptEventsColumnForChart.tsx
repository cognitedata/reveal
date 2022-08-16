import { NptInternal } from 'domain/wells/npt/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/EmptyState';

import { NPT_COLUMN_TITLE } from '../Events/constants';
import {
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnBody,
  EmptyStateWrapper,
} from '../Events/elements';
import NptEventsBadge from '../Events/NptEventsBadge';
import { NptEventsScatterView } from '../Events/NptEventsScatterView';
import { EventsColumnView } from '../Events/types';

import { DepthMeasurementScaleForChart, ScaleLineForChart } from './elements';

export type Props = {
  scaleBlocks: number[];
  events: NptInternal[];
  isEventsLoading?: boolean;
  scaleLineGap?: number;
  view?: EventsColumnView;
};

export const EMPTY_STATE_TEXT =
  'This wellbore has no NPT events data on this depth';
export const LOADING_TEXT = 'Loading';

export const NptEventsColumnForChart: React.FC<Props> = ({
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
            (event) =>
              event.measuredDepth &&
              event.measuredDepth?.value >= row &&
              event.measuredDepth.value < scaleBlocks[index + 1]
          );

          const renderContent = () => {
            if (isEmpty(blockEvents)) {
              return null;
            }

            if (view === EventsColumnView.Scatter) {
              return <NptEventsScatterView events={blockEvents} />;
            }

            return <NptEventsBadge events={blockEvents} />;
          };

          if (index === scaleBlocks.length - 1) {
            return null;
          }

          return (
            <ScaleLineForChart gap={scaleLineGap} key={row}>
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
          <DepthMeasurementScaleForChart>
            {blockElements}
          </DepthMeasurementScaleForChart>
        )}
      </BodyColumnBody>
    </BodyColumn>
  );
};
