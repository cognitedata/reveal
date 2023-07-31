import { NptInternal } from 'domain/wells/npt/internal/types';

import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import EmptyState from 'components/EmptyState';

import { EventTabs } from '../../measurements/wellCentricView/constants';

import { ColumnDragger } from './ColumnDragger';
import { NPT_COLUMN_TITLE } from './constants';
import {
  BodyColumn,
  BodyColumnMainHeader,
  BodyColumnBody,
  ScaleLine,
  DepthMeasurementScale,
  EmptyStateWrapper,
  LastScaleBlock,
  ColumnHeaderWrapper,
  ColumnHeaderWrapperWithRadius,
} from './elements';
import NptEventsBadge from './NptEventsBadge';
import { NptEventsScatterView } from './NptEventsScatterView';

export type Props = {
  scaleBlocks: number[];
  events: NptInternal[];
  isEventsLoading?: boolean;
  view?: EventTabs;
};

export const EMPTY_STATE_TEXT = 'This wellbore has no NPT events data';
export const LOADING_TEXT = 'Loading';

const NptEventsColumn: React.FC<WithDragHandleProps<Props>> = ({
  scaleBlocks,
  events,
  isEventsLoading,
  view,
  ...dragHandleProps
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

          const renderContent = () => {
            if (isEmpty(blockEvents)) {
              return null;
            }

            if (view === EventTabs.scatter) {
              return <NptEventsScatterView events={blockEvents} />;
            }

            return <NptEventsBadge events={blockEvents} />;
          };

          return <ScaleLine key={row}>{renderContent()}</ScaleLine>;
        })}

        {!isEmpty(lastEvents) ? (
          <LastScaleBlock>
            <NptEventsBadge events={lastEvents} />
          </LastScaleBlock>
        ) : null}
      </>
    );
  }, [scaleBlocks, events, view]);

  const isDraggable = !isEmpty(dragHandleProps);

  const HeaderWrapper = isDraggable
    ? ColumnHeaderWrapper
    : ColumnHeaderWrapperWithRadius;

  return (
    <BodyColumn width={150}>
      {isDraggable && <ColumnDragger {...dragHandleProps} />}

      <HeaderWrapper>
        <BodyColumnMainHeader>{NPT_COLUMN_TITLE}</BodyColumnMainHeader>
      </HeaderWrapper>

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
