import React, { useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Chart, ChartTimeSeries } from 'reducers/charts/types';
import { updateSourceCollection } from 'utils/charts';
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
    if (chart.sourceCollection === undefined) {
      console.log('Souyrce collec ', chart.sourceCollection);
      const updatedChart = updateSourceCollection(chart);
      console.log('updatedChart ', updatedChart);
      updateChart(updatedChart);
    }
  }, []);
  console.log('Souyrce collec ', chart.sourceCollection);

  const sources2 = [
    ...(chart?.timeSeriesCollection || []).map((ts, index) => ({
      ...ts,
      render: () => (
        <Draggable key={ts.id} draggableId={ts.id} index={index}>
          {(draggableProvided, snapshot) => (
            <TimeSeriesRow
              key={ts.id}
              mutate={updateChart}
              provided={draggableProvided}
              draggable={draggable}
              chart={chart}
              timeseries={ts}
              isWorkspaceMode={isWorkspaceMode}
              onRowClick={onRowClick}
              onInfoClick={onInfoClick}
              isSelected={selectedSourceId === ts.id}
              disabled={isEditorMode}
              isFileViewerMode={isFileViewerMode}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          )}
        </Draggable>
      ),
    })),
    ...(chart?.workflowCollection || []).map((flow, index) => ({
      ...flow,
      render: () => (
        <Draggable key={flow.id} draggableId={flow.id} index={index}>
          {(draggableProvided, snapshot) => (
            <WorkflowRow
              provided={draggableProvided}
              draggable={draggable}
              key={flow.id}
              workflow={flow}
              chart={chart}
              isSelected={selectedSourceId === flow.id}
              onRowClick={onRowClick}
              onInfoClick={onInfoClick}
              mode={mode}
              openNodeEditor={openNodeEditor}
              mutate={updateChart}
            />
          )}
        </Draggable>
      ),
    })),
  ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  console.log('Sources2: ', sources2);

  return (
    <>
      {(chart?.sourceCollection || []).map((src, index) => (
        <Draggable key={src.id} draggableId={src.id} index={index}>
          {(draggableProvided, snapshot) => (
            //   <TimeSeriesRow
            //     key={src.id}
            //     mutate={updateChart}
            //     provided={draggableProvided}
            //     draggable={draggable}
            //     chart={chart}
            //     timeseries={src as ChartTimeSeries}
            //     isWorkspaceMode={isWorkspaceMode}
            //     onRowClick={onRowClick}
            //     onInfoClick={onInfoClick}
            //     isSelected={selectedSourceId === src.id}
            //     disabled={isEditorMode}
            //     isFileViewerMode={isFileViewerMode}
            //     dateFrom={dateFrom}
            //     dateTo={dateTo}
            //   />
            // )
            // src.type === 'timeseries' ? (

            // ) : (
            <WorkflowRow
              provided={draggableProvided}
              draggable={draggable}
              key={src.id}
              workflow={src}
              chart={chart}
              isSelected={selectedSourceId === src.id}
              onRowClick={onRowClick}
              onInfoClick={onInfoClick}
              mode={mode}
              openNodeEditor={openNodeEditor}
              mutate={updateChart}
            />
          )}
        </Draggable>
      ))}
    </>
  );

  // return <>{sources2.map((source) => source.render())}</>;
}

export default SourceRows;
