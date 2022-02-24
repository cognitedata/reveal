import { useEffect, useMemo, memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { initializeSourceCollection } from 'models/chart/updates';
import { useTranslations } from 'hooks/translations';
import TimeSeriesRow from './TimeSeriesRow';
import WorkflowRow from './WorkflowRow';

type Props = {
  chart: Chart;
  updateChart: (update: (c: Chart | undefined) => Chart) => void;
  mode: string;
  openNodeEditor: () => void;
  selectedSourceId?: string;
  onRowClick: (id?: string) => void;
  onInfoClick: (id?: string) => void;
  draggable?: boolean;
};

const SourceRows = memo(
  ({
    chart,
    updateChart,
    mode,
    selectedSourceId,
    openNodeEditor,
    onRowClick = () => {},
    onInfoClick = () => {},
    draggable = false,
  }: Props) => {
    const isWorkspaceMode = mode === 'workspace';
    const isEditorMode = mode === 'editor';
    const isFileViewerMode = mode === 'file';

    useEffect(() => {
      if (!chart.sourceCollection || chart.sourceCollection === undefined) {
        updateChart((oldChart) => initializeSourceCollection(oldChart!));
      }
    }, [chart, updateChart]);

    const { t: translations } = useTranslations(
      [...TimeSeriesRow.translationKeys, ...WorkflowRow.translationKeys],
      'SourceTableRow'
    );

    const mapSourceCollection = useMemo(() => {
      return (chart.sourceCollection ?? [])
        .map((x) =>
          x.type === 'timeseries'
            ? {
                type: 'timeseries',
                ...chart?.timeSeriesCollection?.find((ts) => ts.id === x.id),
              }
            : {
                type: 'workflow',
                ...chart?.workflowCollection?.find((flow) => flow.id === x.id),
              }
        )
        .filter(Boolean) as (ChartTimeSeries | ChartWorkflow)[];
    }, [
      chart.sourceCollection,
      chart.timeSeriesCollection,
      chart.workflowCollection,
    ]);

    return (
      <>
        {(mapSourceCollection || []).map(
          (src: ChartTimeSeries | ChartWorkflow, index) => (
            <Draggable key={src.id} draggableId={src.id} index={index}>
              {(draggableProvided) =>
                src.type === 'timeseries' ? (
                  <TimeSeriesRow
                    key={src.id}
                    mutate={updateChart}
                    provided={draggableProvided}
                    draggable={draggable}
                    timeseries={src as ChartTimeSeries}
                    isWorkspaceMode={isWorkspaceMode}
                    onRowClick={onRowClick}
                    onInfoClick={onInfoClick}
                    isSelected={selectedSourceId === src.id}
                    disabled={isEditorMode}
                    isFileViewerMode={isFileViewerMode}
                    dateFrom={chart.dateFrom}
                    dateTo={chart.dateTo}
                    translations={translations}
                  />
                ) : (
                  <WorkflowRow
                    key={src.id}
                    chart={chart}
                    mutate={updateChart}
                    provided={draggableProvided}
                    draggable={draggable}
                    workflow={src as ChartWorkflow}
                    isSelected={selectedSourceId === src.id}
                    onRowClick={onRowClick}
                    onInfoClick={onInfoClick}
                    mode={mode}
                    openNodeEditor={openNodeEditor}
                    translations={translations}
                  />
                )
              }
            </Draggable>
          )
        )}
      </>
    );
  }
);

export default SourceRows;
