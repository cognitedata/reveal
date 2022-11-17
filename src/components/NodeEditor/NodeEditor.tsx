import { Chart, ChartWorkflowV2 } from 'models/chart/types';
import { updateWorkflow } from 'models/chart/updates';
import { useCallback, useEffect, useMemo } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { Icon, toast } from '@cognite/cogs.js';
import { SetterOrUpdater, useRecoilValue } from 'recoil';
import ErrorToast from 'components/ErrorToast/ErrorToast';
import { useUserInfo } from 'hooks/useUserInfo';
import { useIsChartOwner } from 'hooks/user';
import { useOperations } from 'models/operations/atom';
import { availableWorkflows } from 'models/calculation-results/selectors';
import { SourceOption } from './V2/types';
import { getSourceOption, getSourcesFromChart } from './utils';
import ReactFlowNodeEditorContainer from './V2/ReactFlowNodeEditorContainer';
import { defaultTranslations } from './translations';

interface Props {
  chart: Chart;
  workflowId: string;
  onClose: () => void;
  setChart: SetterOrUpdater<Chart | undefined>;
  translations: typeof defaultTranslations;
  onErrorIconClick: (id: string) => void;
}

const NodeEditor = ({
  workflowId,
  chart,
  onClose,
  setChart,
  translations,
  onErrorIconClick,
}: Props) => {
  const t = useMemo(
    () => ({ ...defaultTranslations, ...translations }),
    [translations]
  );
  const { data: login } = useUserInfo();
  const isOwner = useIsChartOwner(chart);

  /**
   * Get all operations
   */
  const [isLoadingOperations, operationsError, operations = []] =
    useOperations();

  /**
   * Calculation run status for error sidebar
   */
  const calculationData = useRecoilValue(availableWorkflows);
  const result = calculationData.find(({ id }) => id === workflowId);

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

  const readOnly = Boolean(login?.id && !isOwner);

  /**
   * Trigger toast if error is present
   */
  useEffect(() => {
    if (operationsError instanceof Error) {
      toast.error(
        <ErrorToast
          title={t['Failed to load Operations']}
          text={t['Please reload the page']}
        />
      );
    }
  }, [operationsError, t]);

  if (isLoadingOperations) {
    return <Icon type="Loader" />;
  }

  /**
   * This could be done using a selector (refactor opportunity)
   */
  const workflow = chart?.workflowCollection?.find(
    (flow) => flow.id === workflowId
  ) as ChartWorkflowV2 | undefined;

  if (!workflow) {
    return <div>No calculation selected</div>;
  }

  /**
   * This could be done using a selector (refactor opportunity)
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
        onClose={onClose}
        onUpdateWorkflow={handleUpdateWorkflow}
        readOnly={readOnly}
        translations={t}
        onErrorIconClick={onErrorIconClick}
        calculationResult={result}
      />
    </ReactFlowProvider>
  );
};

NodeEditor.translationKeys = Object.keys(defaultTranslations);

export default NodeEditor;
