import { filterNdsEventsByRiskTypesSelection } from 'domain/wells/nds/internal/selectors/filterNdsEventsByRiskTypesSelection';
import {
  NdsInternalWithTvd,
  NdsRiskTypesSelection,
} from 'domain/wells/nds/internal/types';
import { isAnyNdsMissingTvd } from 'domain/wells/nds/internal/utils/isAnyNdsMissingTvd';

import React, { useCallback, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { ColumnDragger } from '../../../common/Events/ColumnDragger';
import { NDS_COLUMN_TITLE } from '../../../common/Events/constants';
import {
  BodyColumn,
  ColumnHeaderWrapper,
} from '../../../common/Events/elements';
import NdsEventsBadge from '../../../common/Events/NdsEventsBadge';
import {
  NdsEventsByDepth,
  EMPTY_STATE_TEXT,
} from '../../../common/Events/NdsEventsByDepth';
import { NdsEventsScatterView } from '../../../common/Events/NdsEventsScatterView';
import { EventsColumnView } from '../../../common/Events/types';
import { ColumnNotification } from '../../components/ColumnNotification';
import { ColumnOptionsSelector } from '../../components/ColumnOptionsSelector';
import { DetailPageOption } from '../../components/DetailPageOption';
import { ColumnVisibilityProps } from '../../types';
import {
  DEFAULT_EVENTS_COLUMN_VIEW,
  EVENTS_COLUMN_WIDTH,
  NO_DATA_AMONG_SELECTED_OPTIONS_TEXT,
  NO_OPTIONS_SELECTED_TEXT,
  SOME_EVENT_MISSING_TVD_TEXT,
} from '../constants';
import { EventsColumnBody } from '../elements';

export interface NdsEventsColumnProps extends ColumnVisibilityProps {
  scaleBlocks: number[];
  data?: NdsInternalWithTvd[];
  isLoading?: boolean;
  ndsRiskTypesSelection?: NdsRiskTypesSelection;
  depthMeasurementType?: DepthMeasurementUnit;
  onClickDetailsButton?: () => void;
}

export const NdsEventsColumn: React.FC<
  WithDragHandleProps<NdsEventsColumnProps>
> = React.memo(
  ({
    scaleBlocks,
    data = EMPTY_ARRAY,
    isLoading,
    isVisible = true,
    ndsRiskTypesSelection,
    depthMeasurementType,
    onClickDetailsButton = noop,
    ...dragHandleProps
  }) => {
    const [view, setView] = useState(DEFAULT_EVENTS_COLUMN_VIEW);

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
      (data: NdsInternalWithTvd[]) => {
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
        <BodyColumn width={EVENTS_COLUMN_WIDTH} data-testid="ndsEvents-column">
          <ColumnDragger {...dragHandleProps} />

          <ColumnHeaderWrapper>
            <ColumnOptionsSelector
              options={Object.values(EventsColumnView)}
              selectedOption={view}
              displayValue={NDS_COLUMN_TITLE}
              onChange={setView}
              Footer={<DetailPageOption onClick={onClickDetailsButton} />}
            />
          </ColumnHeaderWrapper>

          <EventsColumnBody>
            <ColumnNotification
              content={SOME_EVENT_MISSING_TVD_TEXT}
              visible={
                depthMeasurementType === DepthMeasurementUnit.TVD &&
                isAnyNdsMissingTvd(filteredData)
              }
            />

            <NdsEventsByDepth
              scaleBlocks={scaleBlocks}
              events={filteredData}
              isLoading={isLoading}
              emptySubtitle={emptySubtitle}
              depthMeasurementType={depthMeasurementType}
              renderBlockEvents={renderBlockEvents}
            />
          </EventsColumnBody>
        </BodyColumn>
      </NoUnmountShowHide>
    );
  }
);
