import { Chart, ChartSettings, ChartWorkflowV2 } from 'models/chart/types';
import { updateChartSettings, updateWorkflow } from 'models/chart/updates';
import { useCallback } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { Icon } from '@cognite/cogs.js';
import { SetterOrUpdater } from 'recoil';
import { SourceOption } from './V2/types';
import { useAvailableOps } from './AvailableOps';
import { getSourceOption, getSourcesFromChart } from './utils';
import ConnectEditor from './V1/ConnectNodeEditor';
import ReactFlowNodeEditorContainer from './V2/ReactFlowNodeEditorContainer';

export type NodeEditorProps = {
  chart: Chart;
  workflowId: string;
  onClose: () => void;
  setChart: SetterOrUpdater<Chart | undefined>;
};

const NodeEditor = ({
  workflowId,
  chart,
  onClose,
  setChart,
}: NodeEditorProps) => {
  /**
   * This could be done using a selector
   */
  const workflow = chart?.workflowCollection?.find(
    (flow) => flow.id === workflowId
  );

  /**
   * Get all operations
   */
  const [isLoadingOperations, operationsError, operations = []] =
    useAvailableOps();

  /**
   * Generate all source options
   */
  const sources: SourceOption[] = getSourcesFromChart(chart)
    .filter(({ id }) => id !== workflowId)
    .map((source) => {
      return getSourceOption(source);
    });

  /**
   * Generate update function for workflow
   */
  const handleUpdateWorkflow = useCallback(
    (wf: ChartWorkflowV2) => {
      setChart((oldChart) => {
        return updateWorkflow(oldChart!, workflowId, wf);
      });
    },
    [setChart, workflowId]
  );

  /**
   * Generate update function for chart settings
   */
  const handleUpdateSettings = useCallback(
    (settings: ChartSettings) => {
      setChart((oldChart) => {
        return updateChartSettings(oldChart!, settings);
      });
    },
    [setChart]
  );

  if (operationsError) {
    throw operationsError;
  }

  if (isLoadingOperations) {
    return <Icon type="LoadingSpinner" />;
  }

  /**
   * Handle new versions of workflows
   */
  if (workflow?.version === 'v2') {
    /**
     * This could be done using a selector
     */
    const referenceableWorkflows = (chart.workflowCollection || []).filter(
      ({ version }) => version === 'v2'
    ) as ChartWorkflowV2[];

    return (
      <ReactFlowProvider>
        <ReactFlowNodeEditorContainer
          workflow={workflow}
          workflows={referenceableWorkflows}
          operations={operations}
          sources={sources}
          settings={chart.settings}
          onClose={onClose}
          onUpdateWorkflow={handleUpdateWorkflow}
          onUpdateSettings={handleUpdateSettings}
        />
      </ReactFlowProvider>
    );
  }

  /**
   * Handle old versions of workflows
   */
  return (
    <ConnectEditor
      workflowId={workflowId}
      chart={chart}
      closeNodeEditor={onClose}
      setChart={setChart}
    />
  );
};

export default NodeEditor;
