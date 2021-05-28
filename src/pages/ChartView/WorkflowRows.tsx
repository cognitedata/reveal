import React from 'react';
import { Chart } from 'reducers/charts/types';
import WorkflowRow from './WorkflowRow';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: string;
  openNodeEditor: () => void;
  selectedSourceId?: string;
  onRowClick: (id?: string) => void;
  onInfoClick: (id?: string) => void;
};

export default function WorkflowRows({
  chart,
  updateChart,
  mode,
  openNodeEditor,
  selectedSourceId,
  onRowClick,
  onInfoClick,
}: Props) {
  return (
    <>
      {chart.workflowCollection?.map((flow) => (
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
      ))}
    </>
  );
}
