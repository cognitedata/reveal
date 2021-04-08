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
  onRowClick: (id?: string) => void;
  onInfoClick: (id?: string) => void;
};

export default function WorkflowRows({
  chart,
  updateChart,
  mode,
  setMode,
  selectedSourceId,
  onRowClick,
  onInfoClick,
}: Props) {
  return (
    <>
      {(chart.workflowCollection?.length || 0) > 0 && (
        <tr>
          <TypeLabel colSpan={10}>Calculations</TypeLabel>
        </tr>
      )}
      {chart.workflowCollection?.map((flow) => (
        <WorkflowRow
          key={flow.id}
          workflow={flow}
          chart={chart}
          isSelected={selectedSourceId === flow.id}
          onRowClick={onRowClick}
          onInfoClick={onInfoClick}
          mode={mode}
          setMode={setMode}
          mutate={updateChart}
        />
      ))}
    </>
  );
}
