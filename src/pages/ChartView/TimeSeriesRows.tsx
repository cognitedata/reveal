import React from 'react';
import { Chart } from 'reducers/charts/types';
import { Modes } from 'pages/types';
import TimeSeriesRow from './TimeSeriesRow';
import { TypeLabel } from './elements';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: Modes;
};
export default function TimeSeriesRows({ chart, updateChart, mode }: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isFileViewerMode = mode === 'file';

  return (
    <>
      {(chart?.timeSeriesCollection?.length || 0) > 0 && (
        <tr>
          <TypeLabel colSpan={6}>Time series</TypeLabel>
        </tr>
      )}
      {chart?.timeSeriesCollection?.map((t) => (
        <TimeSeriesRow
          mutate={updateChart}
          chart={chart}
          timeseries={t}
          active={false}
          disabled={isEditorMode}
          isWorkspaceMode={isWorkspaceMode}
          isFileViewerMode={isFileViewerMode}
          key={t.id}
        />
      ))}
    </>
  );
}
