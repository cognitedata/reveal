import React from 'react';
import { Chart } from 'reducers/charts/types';
import { Modes } from 'pages/types';
import TimeSeriesRow from './TimeSeriesRow';
import { TypeLabel } from './elements';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: Modes;
  setDataQualityReport: (input: {
    timeSeriesId: string;
    reportType: string;
  }) => void;
};
export default function TimeSeriesRows({
  chart,
  updateChart,
  setDataQualityReport,
  mode,
}: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isDataQualityMode = mode === 'report';

  return (
    <>
      {(chart?.timeSeriesCollection?.length || 0) > 0 && (
        <tr>
          <TypeLabel colSpan={5}>Time series</TypeLabel>
        </tr>
      )}
      {chart?.timeSeriesCollection?.map((t) => (
        <TimeSeriesRow
          mutate={updateChart}
          chart={chart}
          timeseries={t}
          setDataQualityReport={setDataQualityReport}
          active={false}
          disabled={isEditorMode}
          isDataQualityMode={isDataQualityMode}
          isWorkspaceMode={isWorkspaceMode}
          key={t.id}
        />
      ))}
    </>
  );
}
