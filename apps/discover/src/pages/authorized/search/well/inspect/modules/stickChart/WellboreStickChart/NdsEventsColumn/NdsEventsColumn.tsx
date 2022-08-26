import { filterNdsEventsByRiskTypesSelection } from 'domain/wells/nds/internal/selectors/filterNdsEventsByRiskTypesSelection';
import {
  NdsInternal,
  NdsRiskTypesSelection,
} from 'domain/wells/nds/internal/types';

import React, { useCallback } from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { NDS_COLUMN_TITLE } from '../../../common/Events/constants';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';
import NdsEventsBadge from '../../../common/Events/NdsEventsBadge';
import {
  NdsEventsByDepth,
  EMPTY_STATE_TEXT,
} from '../../../common/Events/NdsEventsByDepth';
import { NdsEventsScatterView } from '../../../common/Events/NdsEventsScatterView';
import { EventsColumnView } from '../../../common/Events/types';
import { ColumnVisibilityProps } from '../../types';
import {
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
} from '../constants';

export interface NdsEventsColumnProps extends ColumnVisibilityProps {
  scaleBlocks: number[];
  data?: NdsInternal[];
  isLoading?: boolean;
  view?: EventsColumnView;
  ndsRiskTypesSelection?: NdsRiskTypesSelection;
}

export const NdsEventsColumn: React.FC<
  WithDragHandleProps<NdsEventsColumnProps>
> = React.memo(
  ({
    scaleBlocks,
    data = EMPTY_ARRAY,
    isLoading,
    view,
    isVisible = true,
    ndsRiskTypesSelection,
    ...dragHandleProps
  }) => {
    const filteredData = useDeepMemo(() => {
      if (!ndsRiskTypesSelection) {
        return data;
      }
      return filterNdsEventsByRiskTypesSelection(data, ndsRiskTypesSelection);
    }, [data, ndsRiskTypesSelection]);

    const emptySubtitle = useDeepMemo(() => {
      if (ndsRiskTypesSelection && isEmpty(ndsRiskTypesSelection)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (!isEmpty(data) && isEmpty(filteredData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return EMPTY_STATE_TEXT;
    }, [data, filteredData, ndsRiskTypesSelection]);

    const renderBlockEvents = useCallback(
      (data: NdsInternal[]) => {
        if (isEmpty(data)) {
          return null;
        }

        if (view === EventsColumnView.Scatter) {
          return <NdsEventsScatterView events={data} />;
        }

        return <NdsEventsBadge events={data} />;
      },
      [view]
    );

    return (
      <NoUnmountShowHide show={isVisible}>
        <BodyColumn width={150}>
          <ColumnDragger {...dragHandleProps} />

          <ColumnHeaderWrapper>
            <BodyColumnMainHeader>{NDS_COLUMN_TITLE}</BodyColumnMainHeader>
          </ColumnHeaderWrapper>

          <BodyColumnBody>
            <NdsEventsByDepth
              scaleBlocks={scaleBlocks}
              events={filteredData}
              isLoading={isLoading}
              emptySubtitle={emptySubtitle}
              renderBlockEvents={renderBlockEvents}
            />
          </BodyColumnBody>
        </BodyColumn>
      </NoUnmountShowHide>
    );
  }
);
