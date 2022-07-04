import { memo, ComponentProps } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  ChartTimeSeries,
  ChartWorkflow,
} from 'models/charts/charts/types/types';
import { useTranslations } from 'hooks/translations';
import { TimeseriesEntry } from 'models/charts/timeseries-results/types';
import { WorkflowState } from 'models/calculation-backend/calculation-results/types';
import TimeSeriesRow from './TimeSeriesRow';
import WorkflowRow from './WorkflowRow';

type Props = {
  sources: (ChartTimeSeries | ChartWorkflow)[];
  summaries: {
    [key: string]: ComponentProps<
      typeof TimeSeriesRow | typeof WorkflowRow
    >['summary'];
  };
  mode: string;
  openNodeEditor: () => void;
  selectedSourceId?: string;
  onRowClick: (id?: string) => void;
  onInfoClick: (id?: string) => void;
  onThresholdClick: (id?: string) => void;
  draggable?: boolean;
  timeseriesData?: TimeseriesEntry[];
  calculationData?: WorkflowState[];
  onOverrideUnitClick?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onOverrideUnitClick'];
  onConversionUnitClick?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onConversionUnitClick'];
  onResetUnitClick?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onResetUnitClick'];
  onCustomUnitLabelClick?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onCustomUnitLabelClick'];
  onStatusIconClick?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onStatusIconClick'];
  onRemoveSourceClick?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onRemoveSourceClick'];
  onUpdateAppearance?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onUpdateAppearance'];
  onUpdateName?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<
    typeof TimeSeriesRow | typeof WorkflowRow
  >['onUpdateName'];
  onDuplicateCalculation?: (
    source: ChartTimeSeries | ChartWorkflow
  ) => ComponentProps<typeof WorkflowRow>['onDuplicateCalculation'];
};

const SourceRows = memo(
  ({
    sources = [],
    summaries,
    mode,
    selectedSourceId,
    openNodeEditor = () => {},
    timeseriesData = [],
    calculationData = [],
    onRowClick = () => {},
    onInfoClick = () => {},
    onThresholdClick = () => {},
    onOverrideUnitClick = () => () => {},
    onConversionUnitClick = () => () => {},
    onResetUnitClick = () => () => {},
    onCustomUnitLabelClick = () => () => {},
    onStatusIconClick = () => () => {},
    onRemoveSourceClick = () => () => {},
    onUpdateAppearance = () => () => {},
    onUpdateName = () => () => {},
    onDuplicateCalculation = () => () => {},
    draggable = false,
  }: Props) => {
    const isWorkspaceMode = mode === 'workspace';
    const isEditorMode = mode === 'editor';
    const isFileViewerMode = mode === 'file';

    const { t: translations } = useTranslations(
      [...TimeSeriesRow.translationKeys, ...WorkflowRow.translationKeys],
      'SourceTableRow'
    );

    return (
      <>
        {sources.map((src, index) => (
          <Draggable key={src.id} draggableId={src.id} index={index}>
            {(draggableProvided) =>
              src.type === 'timeseries' ? (
                <TimeSeriesRow
                  key={src.id}
                  summary={
                    summaries[(src as ChartTimeSeries).tsExternalId || '']
                  }
                  provided={draggableProvided}
                  draggable={draggable}
                  timeseries={src as ChartTimeSeries}
                  isWorkspaceMode={isWorkspaceMode}
                  onRowClick={onRowClick}
                  onInfoClick={onInfoClick}
                  onThresholdClick={onThresholdClick}
                  isSelected={selectedSourceId === src.id}
                  disabled={isEditorMode}
                  isFileViewerMode={isFileViewerMode}
                  translations={translations}
                  timeseriesResult={timeseriesData.find(
                    ({ externalId }) =>
                      externalId === (src as ChartTimeSeries).tsExternalId
                  )}
                  onOverrideUnitClick={onOverrideUnitClick(src)}
                  onConversionUnitClick={onConversionUnitClick(src)}
                  onResetUnitClick={onResetUnitClick(src)}
                  onCustomUnitLabelClick={onCustomUnitLabelClick(src)}
                  onStatusIconClick={onStatusIconClick(src)}
                  onRemoveSourceClick={onRemoveSourceClick(src)}
                  onUpdateAppearance={onUpdateAppearance(src)}
                  onUpdateName={onUpdateName(src)}
                />
              ) : (
                <WorkflowRow
                  key={src.id}
                  summary={summaries[src.id]}
                  provided={draggableProvided}
                  draggable={draggable}
                  workflow={src as ChartWorkflow}
                  isSelected={selectedSourceId === src.id}
                  onRowClick={onRowClick}
                  onInfoClick={onInfoClick}
                  onThresholdClick={onThresholdClick}
                  mode={mode}
                  openNodeEditor={openNodeEditor}
                  translations={translations}
                  calculationResult={calculationData.find(
                    ({ id }) => id === src.id
                  )}
                  onOverrideUnitClick={onOverrideUnitClick(src)}
                  onConversionUnitClick={onConversionUnitClick(src)}
                  onResetUnitClick={onResetUnitClick(src)}
                  onCustomUnitLabelClick={onCustomUnitLabelClick(src)}
                  onStatusIconClick={onStatusIconClick(src)}
                  onRemoveSourceClick={onRemoveSourceClick(src)}
                  onUpdateAppearance={onUpdateAppearance(src)}
                  onUpdateName={onUpdateName(src)}
                  onDuplicateCalculation={onDuplicateCalculation(src)}
                />
              )
            }
          </Draggable>
        ))}
      </>
    );
  }
);

export default SourceRows;
