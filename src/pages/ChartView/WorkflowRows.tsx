import React from 'react';
import { Chart } from 'reducers/charts/types';
import { Modes } from 'pages/types';
import WorkflowRow from './WorkflowRow';
import { TypeLabel } from './elements';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: string;
  setMode: (m: Modes) => void;
  selectedSourceId?: string;
  onRowClick: (id: string | undefined) => void;
};

export default function WorkflowRows({
  chart,
  updateChart,
  mode,
  setMode,
  selectedSourceId,
  onRowClick,
}: Props) {
  return (
    <>
      {(chart.workflowCollection?.length || 0) > 0 && (
        <tr>
          <TypeLabel colSpan={5}>Calculations</TypeLabel>
        </tr>
      )}
      {chart.workflowCollection?.map((flow) => (
        <WorkflowRow
          key={flow.id}
          workflow={flow}
          chart={chart}
          isSelected={selectedSourceId === flow.id}
          onRowClick={onRowClick}
          mode={mode}
          setMode={setMode}
          mutate={updateChart}
        />
      ))}
    </>
  );
}
