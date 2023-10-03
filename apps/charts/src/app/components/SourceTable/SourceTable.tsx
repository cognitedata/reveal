/**
 * Source Table
 */
import { ComponentProps, useCallback } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import {
  ChartTimeSeries,
  ChartWorkflow,
  ScheduledCalculation,
} from '@cognite/charts-lib';

import { WorkflowState } from '../../models/calculation-results/types';
import { ScheduledCalculationsDataMap } from '../../models/scheduled-calculation-results/types';
import { TimeseriesEntry } from '../../models/timeseries-results/types';
import { Modes } from '../../pages/types';

import { SourceTableWrapper, Table } from './elements';
import SourceRows from './SourceRows';
import { SourceTableHeader } from './SourceTableHeader';
import TimeSeriesRows from './TimeSeriesRows';

type Props = {
  mode: Modes;
  sources: (ChartTimeSeries | ChartWorkflow | ScheduledCalculation)[];
  summaries: ComponentProps<typeof SourceRows>['summaries'];
  headerTranslations: ComponentProps<typeof SourceTableHeader>['translations'];
  onShowHideButtonClick?: ComponentProps<
    typeof SourceTableHeader
  >['onShowHideButtonClick'];
  isEveryRowHidden?: boolean;
  selectedSourceId?: ComponentProps<typeof SourceRows>['selectedSourceId'];
  timeseriesData?: TimeseriesEntry[];
  calculationData?: WorkflowState[];
  scheduledCalculationsData?: ScheduledCalculationsDataMap;
  openNodeEditor?: ComponentProps<typeof SourceRows>['openNodeEditor'];
  onRowClick?: ComponentProps<typeof SourceRows>['onRowClick'];
  onInfoClick?: ComponentProps<typeof SourceRows>['onInfoClick'];
  onErrorIconClick?: ComponentProps<typeof SourceRows>['onErrorIconClick'];
  onOverrideUnitClick?: ComponentProps<
    typeof SourceRows
  >['onOverrideUnitClick'];
  onConversionUnitClick?: ComponentProps<
    typeof SourceRows
  >['onConversionUnitClick'];
  onResetUnitClick?: ComponentProps<typeof SourceRows>['onResetUnitClick'];
  onCustomUnitLabelClick?: ComponentProps<
    typeof SourceRows
  >['onCustomUnitLabelClick'];
  onStatusIconClick?: ComponentProps<typeof SourceRows>['onStatusIconClick'];
  onRemoveSourceClick?: ComponentProps<
    typeof SourceRows
  >['onRemoveSourceClick'];
  onUpdateAppearance?: ComponentProps<typeof SourceRows>['onUpdateAppearance'];
  onUpdateName?: ComponentProps<typeof SourceRows>['onUpdateName'];
  onDuplicateCalculation?: ComponentProps<
    typeof SourceRows
  >['onDuplicateCalculation'];
  onMoveSource?: (sourceIndex: number, destinationIndex: number) => void;
};

const SourceTable = ({
  mode,
  sources = [],
  summaries,
  isEveryRowHidden = false,
  headerTranslations,
  selectedSourceId,
  timeseriesData = [],
  calculationData = [],
  scheduledCalculationsData = {},
  openNodeEditor = () => {},
  onRowClick = () => {},
  onInfoClick = () => {},
  onErrorIconClick = () => {},
  onShowHideButtonClick = () => {},
  onOverrideUnitClick = () => () => {},
  onConversionUnitClick = () => () => {},
  onResetUnitClick = () => () => {},
  onCustomUnitLabelClick = () => () => {},
  onStatusIconClick = () => () => {},
  onRemoveSourceClick = () => () => {},
  onUpdateAppearance = () => () => {},
  onUpdateName = () => () => {},
  onDuplicateCalculation = () => () => {},
  onMoveSource = () => {},
}: Props) => {
  const onDragEnd = useCallback(
    (result: any) => {
      if (result.destination) {
        onMoveSource(result.source.index, result.destination.index);
      }
    },
    [onMoveSource]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-sources">
        {(provided) => (
          <SourceTableWrapper>
            <Table ref={provided?.innerRef || null}>
              <SourceTableHeader
                mode={mode}
                onShowHideButtonClick={onShowHideButtonClick}
                showHideIconState={!isEveryRowHidden}
                translations={headerTranslations}
              />
              <tbody>
                {mode === 'file' ? (
                  <TimeSeriesRows
                    mode={mode}
                    sources={
                      sources.filter(
                        ({ type }) => type === 'timeseries'
                      ) as ChartTimeSeries[]
                    }
                    summaries={summaries}
                    onRemoveSourceClick={onRemoveSourceClick}
                  />
                ) : (
                  <>
                    <SourceRows
                      draggable
                      sources={sources}
                      summaries={summaries}
                      mode={mode}
                      selectedSourceId={selectedSourceId}
                      openNodeEditor={openNodeEditor}
                      onRowClick={onRowClick}
                      onInfoClick={onInfoClick}
                      onErrorIconClick={onErrorIconClick}
                      timeseriesData={timeseriesData}
                      calculationData={calculationData}
                      scheduledCalculationsData={scheduledCalculationsData}
                      onOverrideUnitClick={onOverrideUnitClick}
                      onConversionUnitClick={onConversionUnitClick}
                      onResetUnitClick={onResetUnitClick}
                      onCustomUnitLabelClick={onCustomUnitLabelClick}
                      onStatusIconClick={onStatusIconClick}
                      onRemoveSourceClick={onRemoveSourceClick}
                      onUpdateAppearance={onUpdateAppearance}
                      onUpdateName={onUpdateName}
                      onDuplicateCalculation={onDuplicateCalculation}
                    />
                    {provided && provided.placeholder}
                  </>
                )}
              </tbody>
            </Table>
          </SourceTableWrapper>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default SourceTable;
