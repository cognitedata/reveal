/* eslint camelcase: 0 */

import {
  ComputationStep,
  Operation,
  OperationParametersTypeEnum,
  OperationVersions,
} from '@cognite/calculation-backend';
import { isNil, omit, omitBy } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart,
  ChartWorkflow,
  ChartWorkflowV1,
  ChartWorkflowV2,
  StorableNode,
} from 'models/chart/types';
import { getStepsFromWorkflowReactFlow } from '../V2/transforms';

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
  dspFunction: OperationVersions
): DSPFunctionConfig {
  const pins = dspFunction.inputs.map((input, i) => {
    return {
      name: input.name || `Input ${i + 1}`,
      field: input.param || 'unknown_field',
      types: (input.types || []).map(getBlockTypeFromFunctionType),
      pin: true,
    };
  });

  const parameters = dspFunction.parameters?.map(
    ({ name = 'Unknown Parameter (!)', param, type }) => {
      return {
        name,
        field: param,
        types: [getBlockTypeFromParameterType(type)],
        pin: false,
      };
    }
  );

  const output = [
    {
      name: dspFunction.outputs?.[0]?.name || 'Output',
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
  parameterType: OperationParametersTypeEnum
): string {
  switch (parameterType) {
    case OperationParametersTypeEnum.Int:
      return 'CONSTANT';
    case OperationParametersTypeEnum.Str:
      return 'STRING';
    case OperationParametersTypeEnum.Float:
      return 'FLOAT';
    case OperationParametersTypeEnum.Bool:
      return 'BOOLEAN';
    default:
      return 'UNKNOWN';
  }
}

export function transformParamInput(
  type: OperationParametersTypeEnum,
  value: string
): string | number {
  switch (type) {
    case 'int': {
      if (value === '') return '';
      const parsedInt = parseInt(value, 10);
      return Number.isNaN(parsedInt) ? '' : parsedInt;
    }
    case 'float': {
      if (value === '') return '';
      const parsedFloat = parseFloat(value);
      return Number.isNaN(parsedFloat) ? '' : parsedFloat;
    }
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

export function getVersionFromNode(node: StorableNode) {
  switch (node.functionEffectReference) {
    case 'TOOLBOX_FUNCTION':
      return node.functionData.toolFunction.version || '1.0';
    case 'OUTPUT':
      return '1.0';
    default:
      return '1.0';
  }
}

export function getStepsFromWorkflow(
  chart: Chart,
  workflow: ChartWorkflow,
  operations: Operation[]
) {
  if (!workflow.version) {
    return getStepsFromWorkflowConnect(chart, workflow);
  }
  if (workflow.version === 'v2') {
    return getStepsFromWorkflowReactFlow(
      workflow,
      chart.workflowCollection as ChartWorkflowV2[], // DANGEROUS! Need confirmation
      operations
    );
  }
  return [];
}

export function getStepsFromWorkflowConnect(
  chart: Chart,
  workflow: ChartWorkflowV1
): ComputationStep[] {
  if (!workflow) {
    return [];
  }

  const { nodes, connections } = workflow;

  const outputNode = nodes?.find(
    (node) => node.functionEffectReference === 'OUTPUT'
  );

  if (!outputNode) {
    return [];
  }

  let totalNodes = [...(nodes || [])];
  let totalConnections = { ...connections } as typeof connections;
  const validNodes: StorableNode[] = [outputNode];
  let detectedCircularReference = false;

  /**
   * Resolve connected nodes from the output node (end) and backwards
   */
  function resolveInputNodes(node: StorableNode, illegalReferences: string[]) {
    const updatedIllegalReferences = [...illegalReferences];

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
          );

          if (!nodeCandidate) {
            return undefined;
          }

          let selectedNode: StorableNode = nodeCandidate;

          const isCalculationReference =
            nodeCandidate.functionEffectReference === 'SOURCE_REFERENCE' &&
            nodeCandidate.functionData.type === 'workflow';

          if (isCalculationReference) {
            const referencedWorkflow = chart.workflowCollection?.find(
              ({ id }) => id === nodeCandidate.functionData.sourceId
            ) as ChartWorkflowV1;

            if (!referencedWorkflow) {
              return undefined;
            }

            if (illegalReferences.includes(referencedWorkflow.id)) {
              detectedCircularReference = true;
              return undefined;
            }

            updatedIllegalReferences.push(referencedWorkflow.id);

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

            const referenceConnectionId = uuidv4();

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
      inputNodes.forEach((inputNode) =>
        resolveInputNodes(inputNode, updatedIllegalReferences)
      );
    });
  }

  resolveInputNodes(outputNode!, [workflow.id]);

  if (detectedCircularReference) {
    return [];
  }

  const steps: ComputationStep[] = validNodes
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

          const inputNode = validNodes?.find(
            (nd) => nd.id === inputNodeConnection.outputPin.nodeId
          );

          if (!inputNode) {
            return undefined;
          }

          return getInputFromNode(inputNode, allNodes);
        })
        .filter(Boolean);

      const { toolFunction, attachTo, ...parameters } = node.functionData || {};

      const filteredParameters = omitBy(
        parameters,
        (val) => isNil(val) || val === ''
      );

      return {
        step: i,
        op: getOperationFromNode(node),
        version: getVersionFromNode(node),
        inputs,
        ...(Object.keys(filteredParameters).length
          ? { params: filteredParameters }
          : {}),
      };
    });

  return steps;
}
