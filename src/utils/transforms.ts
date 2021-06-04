/* eslint camelcase: 0 */

import { omit } from 'lodash';
import { nanoid } from 'nanoid';
import { Chart, StorableNode } from 'reducers/charts/types';
import { FLOAT_NUMBER_PATTERN } from './constants';

export type DSPFunction = {
  category: string;
  description: string;
  op: string;
  n_inputs: number;
  n_outputs: number;
  parameters: DSPFunctionParameter[];
  type_info: string[][];
};

export enum DSPFunctionParameterType {
  string = 'str',
  int = 'int',
  float = 'float',
  boolean = 'bool',
}

export type DSPFunctionParameter = {
  param: string;
  type: DSPFunctionParameterType;
  default?: any;
};

export type DSPFunctionConfig = {
  input: {
    name: string;
    field: string;
    types: string[];
    pin?: boolean;
  }[];
  output: {
    name: string;
    field: string;
    type: string;
  }[];
};

export function getConfigFromDspFunction(
  dspFunction: DSPFunction
): DSPFunctionConfig {
  const pins = Array(dspFunction.n_inputs)
    .fill(0)
    .map((_, i) => {
      return {
        name: `Input ${i + 1}`,
        field: `input${i}`,
        types: (dspFunction.type_info[i] || []).map(
          getBlockTypeFromFunctionType
        ),
        pin: true,
      };
    });

  const parameters = dspFunction.parameters.map(({ param, type }) => {
    return {
      name: param,
      field: param,
      types: [getBlockTypeFromParameterType(type)],
      pin: false,
    };
  });

  const output = [
    {
      name: 'Output',
      field: 'result',
      type: getBlockTypeFromFunctionType('ts'),
    },
  ];

  return {
    input: [...pins, ...parameters],
    output,
  };
}

export function getBlockTypeFromParameterType(
  parameterType: DSPFunctionParameterType
): string {
  switch (parameterType) {
    case DSPFunctionParameterType.int:
      return 'CONSTANT';
    case DSPFunctionParameterType.string:
      return 'STRING';
    case DSPFunctionParameterType.float:
      return 'FLOAT';
    case DSPFunctionParameterType.boolean:
      return 'BOOLEAN';
    default:
      return 'UNKNOWN';
  }
}

export function transformParamInput(
  type: DSPFunctionParameterType,
  value: string
): string | number {
  switch (type) {
    case DSPFunctionParameterType.int:
      return value === '' ? '' : Number(value);
    case DSPFunctionParameterType.float:
      // eslint-disable-next-line
      const match = value.match(FLOAT_NUMBER_PATTERN);
      // eslint-disable-next-line
      const parsedValue = match && match[0] ? match[0] : parseFloat(value);
      return value === '' ? value : parsedValue;
    case DSPFunctionParameterType.string:
      return value;
    default:
      return value;
  }
}

export function getBlockTypeFromFunctionType(functionType: string): string {
  switch (functionType) {
    case 'ts':
      return 'TIMESERIES';
    case 'const':
      return 'CONSTANT';
    default:
      return 'UNKNOWN';
  }
}

export function getInputFromNode(node: StorableNode, allNodes: StorableNode[]) {
  switch (node.functionEffectReference) {
    case 'TOOLBOX_FUNCTION':
      return {
        type: 'result',
        value: allNodes.findIndex((n) => n.id === node.id),
      };
    case 'OUTPUT':
      return {
        type: 'result',
        value: allNodes.findIndex((n) => n.id === node.id),
      };
    case 'TIME_SERIES_REFERENCE':
      return {
        type: 'ts',
        value: node.functionData.timeSeriesExternalId,
      };
    case 'SOURCE_REFERENCE':
      return {
        type: 'ts',
        value: node.functionData.sourceId,
      };
    case 'CONSTANT':
      return { type: 'const', value: node.functionData.value };
    default:
      return { type: 'unknown', value: 'could not resolve' };
  }
}

export function getOperationFromNode(node: StorableNode) {
  switch (node.functionEffectReference) {
    case 'TOOLBOX_FUNCTION':
      return node.functionData.toolFunction.op;
    case 'OUTPUT':
      return 'PASSTHROUGH';
    default:
      return 'PASSTHROUGH';
  }
}

export function getStepsFromWorkflow(
  chart: Chart,
  nodes: StorableNode[] | undefined,
  connections: Record<string, any> | undefined
) {
  const outputNode = nodes?.find(
    (node) => node.functionEffectReference === 'OUTPUT'
  );

  if (!outputNode) {
    return [];
  }

  let totalNodes = [...(nodes || [])];
  let totalConnections = { ...connections } as typeof connections;
  const validNodes: StorableNode[] = [outputNode];

  /**
   * Resolve connected nodes from the output node (end) and backwards
   */
  function resolveInputNodes(node: StorableNode) {
    node.inputPins.forEach((inputPin: any) => {
      const inputNodeConnections = Object.values(totalConnections || {})
        .filter(Boolean)
        .filter((conn) => {
          return (
            conn.inputPin.nodeId === node.id &&
            conn.inputPin.pinId === inputPin.id
          );
        });

      if (!inputNodeConnections.length) {
        return;
      }

      const inputNodes = inputNodeConnections
        .map((inputNodeConnection) => {
          const nodeCandidate = totalNodes?.find(
            (nd) => nd.id === inputNodeConnection.outputPin.nodeId
          )!;

          let selectedNode: StorableNode = nodeCandidate;

          const isCalculationReference =
            nodeCandidate.functionEffectReference === 'SOURCE_REFERENCE' &&
            nodeCandidate.functionData.type === 'workflow';

          if (isCalculationReference) {
            const referencedWorkflow = chart.workflowCollection?.find(
              ({ id }) => id === nodeCandidate.functionData.sourceId
            );

            const wfOutputNode = referencedWorkflow?.nodes?.find(
              (nd) => nd.functionEffectReference === 'OUTPUT'
            );

            if (!wfOutputNode) {
              return undefined;
            }

            totalConnections = {
              ...totalConnections,
              ...(referencedWorkflow?.connections || {}),
            };

            totalNodes = [
              ...(nodes || []),
              ...(referencedWorkflow?.nodes || []),
            ];

            const outputPinId = 'out-result';

            selectedNode = {
              ...wfOutputNode,
              outputPins: [
                {
                  id: outputPinId,
                  type: 'TIMESERIES',
                },
              ],
            };

            const nodeCandidateConnection = Object.values(
              totalConnections || {}
            ).find(
              (conn) =>
                conn.outputPin.nodeId === nodeCandidate.id &&
                conn.outputPin.pinId === nodeCandidate.outputPins[0]?.id
            );

            const referenceConnectionId = nanoid();

            const referenceConnection = {
              [referenceConnectionId]: {
                outputPin: {
                  nodeId: selectedNode.id,
                  pinId: outputPinId,
                },
                inputPin: nodeCandidateConnection.inputPin,
                id: referenceConnectionId,
              },
            };

            totalConnections = omit(
              {
                ...totalConnections,
                ...referenceConnection,
              },
              [inputNodeConnection.id]
            );
          }

          return selectedNode;
        })
        .filter(Boolean) as StorableNode[];

      if (!inputNodes.length) {
        return;
      }

      inputNodes.forEach((inputNode) => validNodes.unshift(inputNode));
      inputNodes.forEach(resolveInputNodes);
    });
  }

  resolveInputNodes(outputNode!);

  const steps = validNodes
    .filter((node) =>
      ['TOOLBOX_FUNCTION', 'OUTPUT'].includes(
        node.functionEffectReference || ''
      )
    )
    .map((node, i, allNodes) => {
      const inputs = node.inputPins
        .map((inputPin: any) => {
          const inputNodeConnection = Object.values(
            totalConnections || {}
          ).find(
            (conn) =>
              conn.inputPin.nodeId === node.id &&
              conn.inputPin.pinId === inputPin.id
          );

          if (!inputNodeConnection) {
            return undefined;
          }

          const inputNode = totalNodes?.find(
            (nd) => nd.id === inputNodeConnection.outputPin.nodeId
          )!;

          return getInputFromNode(inputNode, allNodes);
        })
        .filter(Boolean);

      const { toolFunction, ...parameters } = node.functionData || {};

      return {
        step: i,
        op: getOperationFromNode(node),
        inputs,
        ...(Object.keys(parameters).length ? { params: parameters } : {}),
      };
    });

  return steps;
}
