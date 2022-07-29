import { NdsInternal } from 'domain/wells/nds/internal/types';

import React, { useCallback } from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { NDS_COLUMN_TITLE } from '../../../common/Events/constants';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';
import NdsEventsBadge from '../../../common/Events/NdsEventsBadge';
import { NdsEventsByDepth } from '../../../common/Events/NdsEventsByDepth';
import { NdsEventsScatterView } from '../../../common/Events/NdsEventsScatterView';
import { EventsColumnView } from '../../../common/Events/types';

export type Props = {
  scaleBlocks: number[];
  events: NdsInternal[];
  isLoading?: boolean;
  view?: EventsColumnView;
};

export const NdsEventsColumn: React.FC<WithDragHandleProps<Props>> = ({
  scaleBlocks,
  events,
  isLoading,
  view,
  ...dragHandleProps
}: Props) => {
  const renderBlockEvents = useCallback(
    (events: NdsInternal[]) => {
      if (isEmpty(events)) {
        return null;
      }

      if (view === EventsColumnView.Scatter) {
        return <NdsEventsScatterView events={events} />;
      }

      return <NdsEventsBadge events={events} />;
    },
    [view]
  );

  return (
    <BodyColumn width={150}>
      <ColumnDragger {...dragHandleProps} />

      <ColumnHeaderWrapper>
        <BodyColumnMainHeader>{NDS_COLUMN_TITLE}</BodyColumnMainHeader>
      </ColumnHeaderWrapper>

      <BodyColumnBody>
        <NdsEventsByDepth
          scaleBlocks={scaleBlocks}
          events={events}
          isLoading={isLoading}
          renderBlockEvents={renderBlockEvents}
        />
      </BodyColumnBody>
    </BodyColumn>
  );
};
