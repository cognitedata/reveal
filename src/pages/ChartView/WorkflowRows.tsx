import React from 'react';
import { Chart } from 'reducers/charts/types';
import { Modes } from 'pages/types';
import WorkflowRow from './WorkflowRow';
import { TypeLabel } from './elements';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  activeWorkflow?: string;
  setActive: (id: string | undefined) => void;
  setMode: (m: Modes) => void;
};
export default function WorkflowRows({
  chart,
  updateChart,
  setMode,
  setActive,
  activeWorkflow,
}: Props) {
  return (
    <>
      {(chart.workflowCollection?.length || 0) > 0 && (
        <tr>
          <TypeLabel colSpan={6}>Calculations</TypeLabel>
        </tr>
      )}
      {chart.workflowCollection?.map((flow) => (
        <WorkflowRow
          mutate={updateChart}
          chart={chart}
          workflow={flow}
          isActive={activeWorkflow === flow.id}
          setWorkspaceMode={() => setMode('workspace')}
          setActiveSourceItem={setActive}
          key={flow.id}
        />
      ))}
    </>
  );
}
