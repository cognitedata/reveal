/* eslint camelcase: 0 */

import {
  ComputationStep,
  Operation,
  OperationParameters,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import { isNil, omit, omitBy } from 'lodash';
import { nanoid } from 'nanoid';
import {
  Node,
  FlowElement,
  FlowExportObject,
  getIncomers,
  Edge,
  Elements,
} from 'react-flow-renderer';
import {
  Chart,
  ChartWorkflow,
  ChartWorkflowV1,
  ChartWorkflowV2,
  StorableNode,
} from 'models/chart/types';
import { NodeTypes } from 'models/node-editor/types';
import { AUTO_ALIGN_PARAM } from './constants';

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
  dspFunction: Operation
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
    case 'int':
      return value === '' ? '' : Number(value);
    case 'float':
      // eslint-disable-next-line
      let parsedValue = null;
      if (value) {
        parsedValue = parseFloat(value);
      }
      return parsedValue && !Number.isNaN(parsedValue) ? parsedValue : value;
    case 'str':
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

export function getStepsFromWorkflow(chart: Chart, workflow: ChartWorkflow) {
  if (!workflow.version) {
    return getStepsFromWorkflowConnect(
      chart,
      workflow.nodes,
      workflow.connections
    );
  }
  if (workflow.version === 'v2') {
    return getStepsFromWorkflowReactFlow(chart, workflow.flow);
  }
  return [];
}

export function getStepsFromWorkflowConnect(
  chart: Chart,
  nodes: StorableNode[] | undefined,
  connections: Record<string, any> | undefined
): ComputationStep[] {
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
        inputs,
        ...(Object.keys(filteredParameters).length
          ? { params: filteredParameters }
          : {}),
      };
    });

  return steps;
}

const fillReferencedCalculations = (
  chart: Chart,
  elements: Elements
): Elements => {
  const transformedElements = [...elements];
  const hasCalculationReference = transformedElements.some(
    (node) => node.type === NodeTypes.SOURCE && node.data.type === 'workflow'
  );
  let shouldTerminate = false;

  if (!hasCalculationReference) {
    return transformedElements;
  }

  // Handle calculation references by adding their nodes & connections to current workflow
  const calculationReferences = transformedElements.filter(
    (node) => node.type === NodeTypes.SOURCE && node.data.type === 'workflow'
  );

  calculationReferences.forEach((ref) => {
    const referencedWorkflow = chart.workflowCollection?.find(
      ({ id }) => id === ref.data.selectedSourceId
    ) as ChartWorkflowV2;

    if (!referencedWorkflow) {
      shouldTerminate = true;
      return;
    }

    const referencedWorkflowOutput = referencedWorkflow.flow?.elements.find(
      (el) => el.type === NodeTypes.OUTPUT
    );
    const outputEdge = referencedWorkflow.flow?.elements.find(
      (el) =>
        referencedWorkflowOutput &&
        (el as Edge).target === referencedWorkflowOutput.id
    );
    const sourceEdge = transformedElements.find(
      (el) => (el as Edge).source === ref.id
    ) as Edge;

    if (!referencedWorkflowOutput || !outputEdge || !sourceEdge) {
      shouldTerminate = true;
      return;
    }

    // Remove source reference node
    transformedElements.splice(
      transformedElements.findIndex((el) => el.id === ref.id),
      1
    );
    // Add nodes and edges from referenced calculation
    transformedElements.push(
      ...(referencedWorkflow.flow?.elements || []).filter(
        (el) => el.id !== referencedWorkflowOutput.id && el.id !== outputEdge.id
      ),
      {
        ...outputEdge,
        target: sourceEdge.target,
        targetHandle: sourceEdge.targetHandle,
      }
    );
  });

  if (shouldTerminate) {
    return transformedElements;
  }

  return fillReferencedCalculations(chart, transformedElements);
};

const getOperationFromReactFlowNode = (node: FlowElement) => {
  switch (node.type) {
    case NodeTypes.FUNCTION:
      return node.data.toolFunction.op;
    case NodeTypes.OUTPUT:
      return 'PASSTHROUGH';
    default:
      return 'PASSTHROUGH';
  }
};

const getParamsFromReactFlowNode = (chart: Chart, node: FlowElement) => {
  let params = node.data.functionData || {};
  // Add auto-align parameter using the global setting
  if (
    node.data.toolFunction?.parameters?.some(
      (p: OperationParameters) => p.param === AUTO_ALIGN_PARAM
    )
  ) {
    params = { ...params, [AUTO_ALIGN_PARAM]: chart.settings?.autoAlign };
  }

  return params;
};

const getInputFromReactFlowNode = (
  chart: Chart,
  node: FlowElement,
  nodes: FlowElement[]
) => {
  switch (node.type) {
    case NodeTypes.FUNCTION:
      return {
        type: 'result',
        value: nodes.findIndex((n) => n.id === node.id),
      };
    case NodeTypes.OUTPUT:
      return {
        type: 'result',
        value: nodes.findIndex((n) => n.id === node.id),
      };
    case NodeTypes.CONSTANT:
      return { type: 'const', value: node.data.value };
    case NodeTypes.SOURCE:
      return {
        type: 'ts',
        value:
          node.data.type === 'timeseries'
            ? chart.timeSeriesCollection?.find(
                (ts) => ts.id === node.data.selectedSourceId
              )?.tsExternalId
            : '',
      };
    default:
      return { type: 'unknown', value: 'could not resolve' };
  }
};

export const getStepsFromWorkflowReactFlow = (
  chart: Chart,
  flow: FlowExportObject | undefined
) => {
  const elements = fillReferencedCalculations(chart, flow?.elements || []);
  const outputNode = elements.find(
    (node) => node.type === NodeTypes.OUTPUT
  ) as Node;

  if (!outputNode || elements.length === 0) {
    return [];
  }

  let validNodes: Node[] = [outputNode];
  // traversing from output node and all incomers and add it to validNodes until none left.
  function findInputNodes(node: Node) {
    const incomers = getIncomers(node as Node, elements);
    incomers.forEach((n) => {
      // Check for duplicates
      if (validNodes.some((vn) => vn.id === n.id)) {
        // Need to keep the latest ones in the array, so remove previosly added ones
        validNodes = validNodes.filter((vn) => vn.id === n.id);
      }

      validNodes.unshift(n);
      findInputNodes(n);
    });
    return null;
  }
  findInputNodes(outputNode);

  const parsedValidNodes = validNodes
    .filter(
      (node) =>
        node.type &&
        [NodeTypes.FUNCTION, NodeTypes.OUTPUT].includes(node.type as NodeTypes)
    )
    .map((node) => {
      return {
        ...node,
        incomers: getIncomers(node as Node, elements),
        parameters: getParamsFromReactFlowNode(chart, node),
      };
    });

  const steps = parsedValidNodes
    .map((node, i) => {
      const inputs = node.incomers
        .map((incomer) => {
          return getInputFromReactFlowNode(chart, incomer, parsedValidNodes);
        })
        .filter(Boolean);

      return {
        step: i,
        op: getOperationFromReactFlowNode(node),
        inputs,
        ...(Object.keys(node.parameters).length
          ? { params: node.parameters }
          : {}),
      };
    })
    .filter(Boolean);

  return steps;
};
