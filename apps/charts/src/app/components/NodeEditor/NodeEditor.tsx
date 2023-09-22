import { ComponentProps, useCallback, useEffect, useMemo } from 'react';
import { ReactFlowProvider } from 'react-flow-renderer';

import ErrorToast from '@charts-app/components/ErrorToast/ErrorToast';
import { useIsChartOwner } from '@charts-app/hooks/user';
import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import { availableWorkflows } from '@charts-app/models/calculation-results/selectors';
import {
  updateScheduledCalculation,
  updateWorkflow,
} from '@charts-app/models/chart/updates';
import { useOperations } from '@charts-app/models/operations/atom';
import { useScheduledCalculationDataValue } from '@charts-app/models/scheduled-calculation-results/atom';
import { SetterOrUpdater, useRecoilValue } from 'recoil';

import {
  Chart,
  ChartWorkflowV2,
  ScheduledCalculation,
} from '@cognite/charts-lib';
import { Icon, toast } from '@cognite/cogs.js';

import { defaultTranslations } from './translations';
import { getSourceOption, getSourcesFromChart } from './utils';
import ReactFlowNodeEditorContainer from './V2/ReactFlowNodeEditorContainer';
import { SourceOption } from './V2/types';

interface Props {
  chart: Chart;
  sourceId: string;
  onClose: () => void;
  setChart: SetterOrUpdater<Chart | undefined>;
  translations: typeof defaultTranslations;
  onErrorIconClick: (id: string) => void;
  onRemoveSourceClick: ComponentProps<
    typeof ReactFlowNodeEditorContainer
  >['onRemoveSourceClick'];
}

const NodeEditor = ({
  sourceId,
  chart,
  onClose,
  setChart,
  translations,
  onErrorIconClick,
  onRemoveSourceClick,
}: Props) => {
  const t = useMemo(
    () => ({ ...defaultTranslations, ...translations }),
    [translations]
  );
  const { data: login } = useUserInfo();
  const isOwner = useIsChartOwner(chart);
  const scheduledCalculationData = useScheduledCalculationDataValue();

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

  /**
   * Generate all source options
   */
  const sources: SourceOption[] = getSourcesFromChart(chart)
    .filter(({ id }) => id !== sourceId)
    .map((source) => {
      return getSourceOption(source);
    });

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

  const scheduledCalculationResult = scheduledCalculationData?.[sourceId];

  const sourceType = workflow?.type || scheduledCalculation?.type;

  const readOnly =
    Boolean(login?.id && !isOwner) || sourceType === 'scheduledCalculation';

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
    // eslint-disable-next-line
    // @ts-ignore todo(DEGR-2397) react 18 has FC without children
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
        onRemoveSourceClick={onRemoveSourceClick}
        calculationResult={result}
        scheduledCalculationResult={scheduledCalculationResult}
      />
    </ReactFlowProvider>
  );
};

NodeEditor.translationKeys = Object.keys(defaultTranslations);

export default NodeEditor;
