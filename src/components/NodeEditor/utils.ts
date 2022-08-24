import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { SourceOption } from 'components/NodeEditor/V2/types';
import { ComputationStep, Operation } from '@cognite/calculation-backend';
import { uniq } from 'lodash';

export const isWorkflowRunnable = (workflow: ChartWorkflow) => {
  if (!workflow.version) {
    const { nodes } = workflow;
    return (
      nodes && nodes.length > 0 && nodes.filter((node) => !node.outputPins)
    );
  }
  if (workflow.version === 'v2') {
    const elements = workflow.flow?.elements;
    return elements && elements.length > 0;
  }
  return false;
};

export const getSourcesFromChart = (chart: Chart | undefined) => {
  if (!chart) {
    return [];
  }

  const sourceOptions: (ChartWorkflow | ChartTimeSeries)[] = [
    ...(chart.timeSeriesCollection || []).map((ts) => ({
      type: 'timeseries',
      ...ts,
    })),
    ...(chart.workflowCollection || []).map((wf) => ({
      type: 'workflow',
      ...wf,
    })),
  ];

  return sourceOptions;
};

export const getSourceOption = (
  source: ChartWorkflow | ChartTimeSeries
): SourceOption => {
  return {
    type: source.type as 'timeseries' | 'workflow',
    label: source.name,
    color: source.color,
    value: source.id,
  };
};

/**
 * This will be unnecessary if we change to use tsExternalId
 * as 'value' for timeseries sources in getSourceOption
 *
 * The reason for not doing it straight away is that I
 * didn't want to break the existing charts/calculations
 */
export const resolveTimeseriesSourceInSteps = (
  steps: ComputationStep[] = [],
  sources: ChartTimeSeries[] = []
): ComputationStep[] => {
  return steps.map((step) => {
    return {
      ...step,
      inputs: step.inputs.map((input) => {
        if (input.type === 'ts') {
          return {
            ...input,
            value:
              sources.find(({ id }) => id === input.value)?.tsExternalId || '',
          };
        }
        return input;
      }),
    };
  });
};

export const getOperationsGroupedByCategory = (
  availableOperations: Operation[],
  ignoredCategories: string[] = []
) => {
  const categories = availableOperations
    .reduce<string[]>(
      (result, operation) => uniq([...result, operation.category]),
      []
    )
    .filter((category) => !ignoredCategories.includes(category));

  const operationsByCategory = categories.reduce<{
    [key: string]: Operation[];
  }>((result, category) => {
    return {
      ...result,
      [category]: availableOperations.filter(
        (operation) => operation.category === category
      ),
    };
  }, {});

  return operationsByCategory;
};
