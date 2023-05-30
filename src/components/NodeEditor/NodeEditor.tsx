import {
  Chart,
  ChartWorkflowV2,
  ScheduledCalculation,
} from 'models/chart/types';
import {
  updateScheduledCalculation,
  updateWorkflow,
} from 'models/chart/updates';
import { useCallback, useEffect, useMemo } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';
import { Icon, toast } from '@cognite/cogs.js';
import { SetterOrUpdater, useRecoilValue } from 'recoil';
import ErrorToast from 'components/ErrorToast/ErrorToast';
import { useUserInfo } from 'hooks/useUserInfo';
import { useIsChartOwner } from 'hooks/user';
import { useOperations } from 'models/operations/atom';
import { availableWorkflows } from 'models/calculation-results/selectors';
import { useScheduledCalculationDataValue } from 'models/scheduled-calculation-results/atom';
import { SourceOption } from './V2/types';
import { getSourceOption, getSourcesFromChart } from './utils';
import ReactFlowNodeEditorContainer from './V2/ReactFlowNodeEditorContainer';
import { defaultTranslations } from './translations';

interface Props {
  chart: Chart;
  sourceId: string;
  onClose: () => void;
  setChart: SetterOrUpdater<Chart | undefined>;
  translations: typeof defaultTranslations;
  onErrorIconClick: (id: string) => void;
}

const NodeEditor = ({
  sourceId,
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
  const result = calculationData.find(({ id }) => id === sourceId);
  const scheduledCalculationData =
    useScheduledCalculationDataValue()?.[sourceId];

  /**
   * Generate all source options
   */
  const sources: SourceOption[] = getSourcesFromChart(chart)
    .filter(({ id }) => id !== sourceId)
    .map((source) => {
      return getSourceOption(source);
    });

  const readOnly =
    Boolean(login?.id && !isOwner) || Boolean(scheduledCalculationData);

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
    (flow) => flow.id === sourceId
  ) as ChartWorkflowV2 | undefined;

  const scheduledCalculation = chart?.scheduledCalculationCollection?.find(
    (sc) => sc.id === sourceId
  );

  const sourceType = workflow?.type || scheduledCalculation?.type;

  /**
   * Generate update function for workflow
   */
  const handleUpdateWorkflow = useCallback(
    (wf: ChartWorkflowV2 | ScheduledCalculation) => {
      setChart((oldChart) => {
        if (sourceType === 'scheduledCalculation') {
          return updateScheduledCalculation(
            oldChart!,
            sourceId,
            wf as ScheduledCalculation
          );
        }
        return updateWorkflow(oldChart!, sourceId, wf as ChartWorkflowV2);
      });
    },
    [setChart, sourceId]
  );

  if (!(workflow || scheduledCalculation)) {
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
        source={workflow || scheduledCalculation!}
        sourceType={sourceType}
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
