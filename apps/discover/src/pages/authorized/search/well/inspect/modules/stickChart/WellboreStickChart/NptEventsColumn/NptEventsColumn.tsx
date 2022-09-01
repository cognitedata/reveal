import { useNptDefinitions } from 'domain/wells/npt/internal/hooks/useNptDefinitions';
import { filterNptEventsByCodeSelection } from 'domain/wells/npt/internal/selectors/filterNptEventsByCodeSelection';
import {
  NptCodesSelection,
  NptInternalWithTvd,
} from 'domain/wells/npt/internal/types';

import React, { useCallback } from 'react';

import isEmpty from 'lodash/isEmpty';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { NPT_COLUMN_TITLE } from '../../../common/Events/constants';
import {
  BodyColumn,
  BodyColumnBody,
  BodyColumnMainHeader,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';
import NptEventsBadge from '../../../common/Events/NptEventsBadge';
import {
  NptEventsByDepth,
  EMPTY_STATE_TEXT,
} from '../../../common/Events/NptEventsByDepth';
import { NptEventsScatterView } from '../../../common/Events/NptEventsScatterView';
import { EventsColumnView } from '../../../common/Events/types';
import { ColumnVisibilityProps } from '../../types';
import {
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
} from '../constants';

import { NptScatterTooltip } from './components/NptScatterTooltip';

export interface NptEventsColumnProps extends ColumnVisibilityProps {
  scaleBlocks: number[];
  data?: NptInternalWithTvd[];
  isLoading?: boolean;
  view?: EventsColumnView;
  nptCodesSelecton?: NptCodesSelection;
  depthMeasurementType?: DepthMeasurementUnit;
}

export const NptEventsColumn: React.FC<
  WithDragHandleProps<NptEventsColumnProps>
> = React.memo(
  ({
    scaleBlocks,
    data = EMPTY_ARRAY,
    isLoading,
    view,
    nptCodesSelecton,
    depthMeasurementType,
    isVisible = true,
    ...dragHandleProps
  }) => {
    const { nptCodeDefinitions } = useNptDefinitions();

    const filteredData = useDeepMemo(() => {
      if (!nptCodesSelecton) {
        return data;
      }
      return filterNptEventsByCodeSelection(data, nptCodesSelecton);
    }, [data, nptCodesSelecton]);

    const emptySubtitle = useDeepMemo(() => {
      if (nptCodesSelecton && isEmpty(nptCodesSelecton)) {
        return NO_OPTIONS_SELECTED_TEXT;
      }
      if (!isEmpty(data) && isEmpty(filteredData)) {
        return NO_DATA_AMONG_SELECTED_OPTIONS_TEXT;
      }
      return EMPTY_STATE_TEXT;
    }, [data, filteredData]);

    const renderBlockEvents = useCallback(
      (data: NptInternalWithTvd[]) => {
        if (isEmpty(data)) {
          return null;
        }

        if (view === EventsColumnView.Scatter) {
          return (
            <NptEventsScatterView
              events={data}
              renderTooltipContent={({ original }) => (
                <NptScatterTooltip
                  event={original}
                  nptCodeDefinitions={nptCodeDefinitions}
                  depthMeasurementType={depthMeasurementType}
                />
              )}
            />
          );
        }

        return <NptEventsBadge events={data} />;
      },
      [view, depthMeasurementType]
    );

    return (
      <NoUnmountShowHide show={isVisible}>
        <BodyColumn width={130}>
          <ColumnDragger {...dragHandleProps} />

          <ColumnHeaderWrapper>
            <BodyColumnMainHeader>{NPT_COLUMN_TITLE}</BodyColumnMainHeader>
          </ColumnHeaderWrapper>

          <BodyColumnBody>
            <NptEventsByDepth
              scaleBlocks={scaleBlocks}
              events={filteredData}
              isLoading={isLoading}
              emptySubtitle={emptySubtitle}
              depthMeasurementType={depthMeasurementType}
              renderBlockEvents={renderBlockEvents}
            />
          </BodyColumnBody>
        </BodyColumn>
      </NoUnmountShowHide>
    );
  }
);
