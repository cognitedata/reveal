import React from 'react';
import { Chart } from 'reducers/charts/types';
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
}: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isFileViewerMode = mode === 'file';
  const sources = [
    ...(chart?.timeSeriesCollection || []).map((ts) => ({
      ...ts,
      render: () => (
        <TimeSeriesRow
          key={ts.id}
          mutate={updateChart}
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
      ),
    })),
    ...(chart?.workflowCollection || []).map((flow) => ({
      ...flow,
      render: () => (
        <WorkflowRow
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
      ),
    })),
  ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return <>{sources.map((source) => source.render())}</>;
}

export default SourceRows;
