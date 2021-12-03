import { Edge, Elements, Node } from 'react-flow-renderer';
import { Connection } from '@cognite/connect';
import {
  Chart,
  ChartTimeSeries,
  ChartWorkflow,
  ChartWorkflowV1,
  ChartWorkflowV2,
} from 'models/chart/types';
import { node as SourceNode } from 'components/NodeEditor/V1/Nodes/SourceReference';
import { node as ConstantNode } from 'components/NodeEditor/V1/Nodes/Constant';
import { node as FunctionNode } from 'components/NodeEditor/V1/Nodes/DSPToolboxFunction';
import { node as OutputNode } from 'components/NodeEditor/V1/Nodes/OutputSeries';
import { NodeTypes, SourceOption } from 'components/NodeEditor/V2/types';
import { ComputationStep } from '@cognite/calculation-backend';
import { getConfigFromDspFunction } from './V1/transforms';

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

export const convertWorkflowToV1 = (
  workflow: ChartWorkflowV2
): Partial<ChartWorkflowV1> => {
  if (!workflow.flow) {
    return { version: '', nodes: [], connections: [] };
  }

  const { elements } = workflow.flow;
  const nodes = (elements as Elements)
    .filter((el) => el.type !== 'default')
    .map((el) => {
      switch (el.type) {
        case NodeTypes.SOURCE: {
          const sourceItem =
            (el.data.sourceOptions as SourceOption[]).find(
              (s) => s.value === el.data.selectedSourceId
            ) || el.data.sourceOptions[0];

          return {
            id: el.id,
            ...SourceNode,
            title: sourceItem.label,
            subtitle: sourceItem.type,
            functionData: {
              type: sourceItem.type,
              sourceId: el.data.selectedSourceId,
            },
            ...(el as Node).position,
          };
        }
        case NodeTypes.CONSTANT:
          return {
            id: el.id,
            ...ConstantNode,
            functionData: {
              value: el.data.value,
            },
            ...(el as Node).position,
          };
        case NodeTypes.FUNCTION: {
          const inputPins = (
            getConfigFromDspFunction(el.data.toolFunction).input || []
          )
            .filter((input) => input.pin)
            .map((input) => ({
              id: input.field,
              title: input.name,
              types: input.types,
            }));

          const outputPins = (
            getConfigFromDspFunction(el.data.toolFunction).output || []
          ).map((output) => ({
            id: `out-${output.field}`,
            title: output.name,
            type: output.type,
          }));
          return {
            id: el.id,
            ...FunctionNode,
            title: el.data.toolFunction.name,
            inputPins,
            outputPins,
            functionData: {
              toolFunction: el.data.toolFunction,
              ...el.data.functionData,
            },
            ...(el as Node).position,
          };
        }
        case NodeTypes.OUTPUT:
          return {
            id: el.id,
            ...OutputNode,
            ...(el as Node).position,
          };
        default:
          return el;
      }
    });

  const connections: Record<string, Connection> = {};

  (
    (elements as Elements).filter((el) => el.type === 'default') as Edge[]
  ).forEach((el) => {
    connections[el.id] = {
      id: el.id,
      outputPin: { nodeId: el.source, pinId: el.sourceHandle },
      inputPin: { nodeId: el.target, pinId: el.targetHandle },
    };
  });

  return { version: '', nodes, connections };
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
