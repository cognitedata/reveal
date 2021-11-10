import {
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  ChartWorkflowV2,
} from 'models/chart/types';
import ConnectEditor from './V1/ConnectNodeEditor';
import ReactFlowEditor from './V2/ReactFlowNodeEditorContainer';

export type NodeEditorProps = {
  chart: Chart;
  workflowId: string;
  closeNodeEditor: () => void;
  mutate: (update: (c: Chart | undefined) => Chart) => void;
};

const NodeEditor = ({
  workflowId,
  chart,
  closeNodeEditor,
  mutate,
}: NodeEditorProps) => {
  const workflow = chart?.workflowCollection?.find(
    (flow) => flow.id === workflowId
  );

  const sources = [
    ...(chart.timeSeriesCollection || []).map(
      (ts) =>
        ({
          type: 'timeseries',
          ...ts,
        } as ChartTimeSeries)
    ),
    ...(chart.workflowCollection || []).map(
      (wf) =>
        ({
          type: 'workflow',
          ...wf,
        } as ChartWorkflow)
    ),
  ];
  const inputSources = sources.filter(({ id }) => id !== workflowId);

  /**
   * Handle new versions of workflows
   */
  if (workflow?.version === 'v2') {
    return (
      <ReactFlowEditor
        workflow={workflow as ChartWorkflowV2}
        sources={inputSources}
        closeNodeEditor={closeNodeEditor}
      />
    );
  }

  /**
   * Handle old versions of workflows
   */
  return (
    <ConnectEditor
      mutate={mutate}
      workflowId={workflowId}
      closeNodeEditor={closeNodeEditor}
      chart={chart}
    />
  );
};

export default NodeEditor;
