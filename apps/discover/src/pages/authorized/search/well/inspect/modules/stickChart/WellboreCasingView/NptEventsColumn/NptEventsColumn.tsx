import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';
import { NptInternal } from 'domain/wells/npt/internal/types';

import React, { useCallback } from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { NPT_COLUMN_TITLE } from '../../../common/Events/constants';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';
import NptEventsBadge from '../../../common/Events/NptEventsBadge';
import { NptEventsByDepth } from '../../../common/Events/NptEventsByDepth';
import { NptEventsScatterView } from '../../../common/Events/NptEventsScatterView';
import { EventsColumnView } from '../../../common/Events/types';

import { NptScatterTooltip } from './components/NptScatterTooltip';

export type Props = {
  scaleBlocks: number[];
  events: NptInternal[];
  isLoading?: boolean;
  view?: EventsColumnView;
};

export const NptEventsColumn: React.FC<WithDragHandleProps<Props>> = ({
  scaleBlocks,
  events,
  isLoading,
  view,
  ...dragHandleProps
}: Props) => {
  const { nptCodeDefinitions } = useNptDefinitions();

  const renderBlockEvents = useCallback(
    (events: NptInternal[]) => {
      if (isEmpty(events)) {
        return null;
      }

      if (view === EventsColumnView.Scatter) {
        return (
          <NptEventsScatterView
            events={events}
            renderTooltipContent={({ original }) => (
              <NptScatterTooltip
                event={original}
                nptCodeDefinitions={nptCodeDefinitions}
              />
            )}
          />
        );
      }

      return <NptEventsBadge events={events} />;
    },
    [view]
  );

  return (
    <BodyColumn width={150}>
      <ColumnDragger {...dragHandleProps} />

      <ColumnHeaderWrapper>
        <BodyColumnMainHeader>{NPT_COLUMN_TITLE}</BodyColumnMainHeader>
      </ColumnHeaderWrapper>

      <BodyColumnBody>
        <NptEventsByDepth
          scaleBlocks={scaleBlocks}
          events={events}
          isLoading={isLoading}
          renderBlockEvents={renderBlockEvents}
        />
      </BodyColumnBody>
    </BodyColumn>
  );
};
