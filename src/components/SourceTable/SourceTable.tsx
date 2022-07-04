/**
 * Source Table
 */
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/charts/charts/types/types';
import SourceRows from 'components/SourceTable/SourceRows';
import { Modes } from 'pages/types';
import { ComponentProps, useCallback } from 'react';
import { TimeseriesEntry } from 'models/charts/timeseries-results/types';
import { WorkflowState } from 'models/calculation-backend/calculation-results/types';
import { SourceTableWrapper, Table } from './elements';
import { SourceTableHeader } from './SourceTableHeader';
import TimeSeriesRows from './TimeSeriesRows';

type Props = {
  mode: Modes;
  sources: (ChartTimeSeries | ChartWorkflow)[];
  summaries: ComponentProps<typeof SourceRows>['summaries'];
  headerTranslations: ComponentProps<typeof SourceTableHeader>['translations'];
  onShowHideButtonClick?: ComponentProps<
    typeof SourceTableHeader
  >['onShowHideButtonClick'];
  isEveryRowHidden?: boolean;
  selectedSourceId?: ComponentProps<typeof SourceRows>['selectedSourceId'];
  timeseriesData?: TimeseriesEntry[];
  calculationData?: WorkflowState[];
  openNodeEditor?: ComponentProps<typeof SourceRows>['openNodeEditor'];
  onRowClick?: ComponentProps<typeof SourceRows>['onRowClick'];
  onInfoClick?: ComponentProps<typeof SourceRows>['onInfoClick'];
  onThresholdClick?: ComponentProps<typeof SourceRows>['onThresholdClick'];
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
  openNodeEditor = () => {},
  onRowClick = () => {},
  onInfoClick = () => {},
  onThresholdClick = () => {},
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
      if (!result.destination) {
        return;
      }

      onMoveSource(result.source.index, result.destination.index);
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
                      onThresholdClick={onThresholdClick}
                      timeseriesData={timeseriesData}
                      calculationData={calculationData}
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
