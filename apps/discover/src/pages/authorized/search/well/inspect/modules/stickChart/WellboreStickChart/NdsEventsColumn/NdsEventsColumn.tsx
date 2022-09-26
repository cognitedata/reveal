import { filterNdsEventsByRiskTypesSelection } from 'domain/wells/nds/internal/selectors/filterNdsEventsByRiskTypesSelection';
import {
  NdsInternalWithTvd,
  NdsRiskTypesSelection,
} from 'domain/wells/nds/internal/types';
import { isAnyNdsMissingTvd } from 'domain/wells/nds/internal/utils/isAnyNdsMissingTvd';

import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { WithDragHandleProps } from 'components/DragDropContainer';
import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';

import { NDS_COLUMN_TITLE } from '../../../common/Events/constants';
import { ColumnHeaderWrapper } from '../../../common/Events/elements';
import NdsEventsBadge from '../../../common/Events/NdsEventsBadge';
import {
  NdsEventsByDepth,
  EMPTY_STATE_TEXT,
} from '../../../common/Events/NdsEventsByDepth';
import { EventsColumnView } from '../../../common/Events/types';
import { Column } from '../../components/Column';
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

import { NdsEventsScatterView } from './components/NdsEventsScatterView';

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
    const [expandedScaleBlock, setExpandedScaleBlock] =
      useState<[number, number]>();

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

    const renderBlockEvents = (
      data: NdsInternalWithTvd[],
      scaleBlockRange: [number, number]
    ) => {
      if (isEmpty(data)) {
        return null;
      }

      if (view === EventsColumnView.Scatter) {
        return (
          <NdsEventsScatterView
            events={data}
            depthMeasurementType={depthMeasurementType}
            scaleBlockRange={scaleBlockRange}
            expandedScaleBlock={expandedScaleBlock}
            onExpandOverflowEvents={setExpandedScaleBlock}
          />
        );
      }

      return <NdsEventsBadge events={data} />;
    };

    return (
      <Column
        id="ndsEvents-column"
        isVisible={isVisible}
        width={EVENTS_COLUMN_WIDTH}
        {...dragHandleProps}
      >
        <ColumnHeaderWrapper>
          <ColumnOptionsSelector
            options={Object.values(EventsColumnView)}
            selectedOption={view}
            displayValue={NDS_COLUMN_TITLE}
            onChange={setView}
            Footer={<DetailPageOption onClick={onClickDetailsButton} />}
            disabled={isEmpty(data)}
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
      </Column>
    );
  }
);
