import { NdsInternal } from 'domain/wells/nds/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';

import { EventTabs } from '../../measurements/wellCentricView/constants';

import { ColumnDragger } from './ColumnDragger';
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
import { NdsEventsScatterView } from './NdsEventsScatterView';

export type Props = {
  scaleBlocks: number[];
  events: NdsInternal[];
  isEventsLoading?: boolean;
  view?: EventTabs;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NDS events data';
export const LOADING_TEXT = 'Loading';

const NdsEventsColumn: React.FC<WithDragHandleProps<Props>> = ({
  scaleBlocks,
  events,
  isEventsLoading,
  view,
  ...dragHandleProps
}: Props) => {
  const blockElements = useMemo(() => {
    const lastEvents = events.filter(
      ({ holeStart }) =>
        holeStart && holeStart.value >= scaleBlocks[scaleBlocks.length - 1]
    );

    return (
      <>
        {scaleBlocks.map((row, index) => {
          const blockEvents = events.filter(
            ({ holeStart }) =>
              holeStart &&
              holeStart.value < row &&
              (!index || holeStart.value >= scaleBlocks[index - 1])
          );

          const renderContent = () => {
            if (isEmpty(blockEvents)) {
              return null;
            }

            if (view === EventTabs.scatter) {
              return <NdsEventsScatterView events={blockEvents} />;
            }

            return <NdsEventsBadge events={blockEvents} />;
          };

          return <ScaleLine key={row}>{renderContent()}</ScaleLine>;
        })}

        {!isEmpty(lastEvents) && (
          <LastScaleBlock>
            <NdsEventsBadge events={lastEvents} />
          </LastScaleBlock>
        )}
      </>
    );
  }, [scaleBlocks, events]);

  return (
    <BodyColumn width={150}>
      <ColumnDragger {...dragHandleProps} />

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
