/* eslint camelcase: 0 */

import { StorableNode, Workflow } from 'reducers/workflows';

export type DSPFunction = {
  description: string;
  op: string;
  n_inputs: number;
  n_outputs: number;
  parameters: {
    param: string;
    type: string;
    default?: any;
  }[];
  type_info: string[][];
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

export function getBlockTypeFromParameterType(parameterType: string): string {
  switch (parameterType) {
    case 'int':
      return 'CONSTANT';
    default:
      return 'UNKNOWN';
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

export function getFunctionTypeFromBlockType(blockType: string): string {
  switch (blockType) {
    case 'TOOLBOX_FUNCTION':
      return 'result';
    case 'TIME_SERIES_REFERENCE':
      return 'ts';
    case 'CONSTANT':
      return 'const';
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
    case 'TIME_SERIES_REFERENCE':
      return {
        type: 'ts',
        value: node.functionData.timeSeriesExternalId,
      };
    case 'CONSTANT':
      return { type: 'const', value: node.functionData.value };
    default:
      return { type: 'unknown', value: 'could not resolve' };
  }
}

export function getStepsFromWorkflow(workflow: Workflow) {
  const outputNode = workflow.nodes.find(
    (node) => !node.outputPins || node.outputPins.length === 0
  );

  if (!outputNode) {
    return [];
  }

  const validNodes: StorableNode[] = [];

  /**
   * Resolve connected nodes from the output node (end) and backwards
   */
  function resolveInputNodes(node: StorableNode) {
    node.inputPins.forEach((inputPin: any) => {
      const inputNodeConnections = Object.values(workflow.connections).filter(
        (conn) =>
          conn.inputPin.nodeId === node.id &&
          conn.inputPin.pinId === inputPin.id
      );

      if (!inputNodeConnections.length) {
        return;
      }

      const inputNodes = inputNodeConnections
        .map((inputNodeConnection) => {
          return workflow.nodes.find(
            (nd) => nd.id === inputNodeConnection.outputPin.nodeId
          )!;
        })
        .filter(Boolean);

      if (!inputNodes.length) {
        return;
      }

      inputNodes.forEach((inputNode) => validNodes.unshift(inputNode));
      inputNodes.forEach(resolveInputNodes);
    });
  }

  resolveInputNodes(outputNode!);

  const steps = validNodes
    .filter((node) => node.functionEffectReference === 'TOOLBOX_FUNCTION')
    .map((node, i, allNodes) => {
      const inputs = node.inputPins
        .map((inputPin: any) => {
          const inputNodeConnection = Object.values(workflow.connections).find(
            (conn) =>
              conn.inputPin.nodeId === node.id &&
              conn.inputPin.pinId === inputPin.id
          );

          if (!inputNodeConnection) {
            return undefined;
          }

          const inputNode = workflow.nodes.find(
            (nd) => nd.id === inputNodeConnection.outputPin.nodeId
          )!;

          return getInputFromNode(inputNode, allNodes);
        })
        .filter(Boolean);

      const { toolFunction, ...parameters } = node.functionData || {};

      return {
        step: i,
        op: node.functionData.toolFunction.op,
        inputs,
        ...(Object.keys(parameters).length ? { params: parameters } : {}),
      };
    });

  return steps;
}
