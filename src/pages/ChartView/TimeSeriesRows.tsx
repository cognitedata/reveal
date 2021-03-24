import React from 'react';
import { Chart } from 'reducers/charts/types';
import TimeSeriesRow from './TimeSeriesRow';
import { TypeLabel } from './elements';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: string;
  selectedSourceId?: string;
  onRowClick: (id: string | undefined) => void;
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
  onRowClick,
  selectedSourceId,
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
          key={t.id}
          mutate={updateChart}
          chart={chart}
          timeseries={t}
          isDataQualityMode={isDataQualityMode}
          isWorkspaceMode={isWorkspaceMode}
          onRowClick={onRowClick}
          setDataQualityReport={setDataQualityReport}
          isSelected={selectedSourceId === t.id}
          disabled={isEditorMode}
        />
      ))}
    </>
  );
}
