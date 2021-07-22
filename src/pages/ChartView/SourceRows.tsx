import React, { useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import {
  initializeSourceCollection,
  updateSourceCollection,
} from 'utils/charts';
import TimeSeriesRow from './TimeSeriesRow';
import WorkflowRow from './WorkflowRow';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: string;
  openNodeEditor: () => void;
  selectedSourceId?: string;
  onRowClick: (id?: string) => void;
  onInfoClick: (id?: string) => void;
  dateFrom: string;
  dateTo: string;
  draggable?: boolean;
};

function SourceRows({
  chart,
  updateChart,
  mode,
  selectedSourceId,
  openNodeEditor,
  onRowClick = () => {},
  onInfoClick = () => {},
  dateFrom,
  dateTo,
  draggable = false,
}: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isFileViewerMode = mode === 'file';

  useEffect(() => {
    if (!chart.sourceCollection || chart.sourceCollection === undefined) {
      const updatedChart = initializeSourceCollection(chart);
      updateChart(updatedChart);
    } else {
      const updatedChart = updateSourceCollection(chart); // updateSourceCollection
      updateChart(updatedChart);
    }
  }, [chart, updateChart]);

  const mapSourceCollection: (ChartTimeSeries | ChartWorkflow)[] = (
    chart.sourceCollection ?? []
  )
    .map((x) =>
      x.type === 'timeseries'
        ? chart?.timeSeriesCollection?.find((ts) => ts.id === x.id)
        : chart?.workflowCollection?.find((flow) => flow.id === x.id)
    )
    .filter(Boolean) as (ChartTimeSeries | ChartWorkflow)[];

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
                  chart={chart}
                  timeseries={src as ChartTimeSeries}
                  isWorkspaceMode={isWorkspaceMode}
                  onRowClick={onRowClick}
                  onInfoClick={onInfoClick}
                  isSelected={selectedSourceId === src.id}
                  disabled={isEditorMode}
                  isFileViewerMode={isFileViewerMode}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                />
              ) : (
                <WorkflowRow
                  provided={draggableProvided}
                  draggable={draggable}
                  key={src.id}
                  workflow={src as ChartWorkflow}
                  chart={chart}
                  isSelected={selectedSourceId === src.id}
                  onRowClick={onRowClick}
                  onInfoClick={onInfoClick}
                  mode={mode}
                  openNodeEditor={openNodeEditor}
                  mutate={updateChart}
                />
              )
            }
          </Draggable>
        )
      )}
    </>
  );
}

export default SourceRows;
