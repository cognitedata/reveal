/* eslint camelcase: 0 */

import {
  ComputationStep,
  OperationParameters,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import {
  Node,
  FlowElement,
  getIncomers,
  Edge,
  Elements,
  getOutgoers,
  isEdge,
  removeElements,
} from 'react-flow-renderer';
import { ChartWorkflowV2 } from 'models/chart/types';
import { NodeDataVariants } from 'components/NodeEditor/V2/types';
import { FunctionNodeData } from 'components/NodeEditor/V2/Nodes/FunctionNode/FunctionNode';
import { NodeTypes } from './types';
import { AUTO_ALIGN_PARAM } from './constants';
import { SourceNodeData } from './Nodes/SourceNode';

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

const fillReferencedCalculations = (
  workflows: ChartWorkflowV2[],
  elements: Elements = [],
  illegalReferences: string[]
): Elements => {
  let transformedElements = [...elements];
  const hasCalculationReference = transformedElements.some(
    (node) => node.type === NodeTypes.SOURCE && node.data.type === 'workflow'
  );
  let shouldTerminate = false;

  if (!hasCalculationReference) {
    return transformedElements;
  }

  // Keep track of visited references to avoid circular dependencies
  const updatedIllegalReferences = [...illegalReferences];

  // Handle calculation references by adding their nodes & connections to current workflow
  const calculationReferences = transformedElements.filter(
    (node) => node.type === NodeTypes.SOURCE && node.data.type === 'workflow'
  );

  calculationReferences.forEach((ref) => {
    const referencedWorkflow = workflows.find(
      ({ id }) => id === ref.data.selectedSourceId
    ) as ChartWorkflowV2;

    if (!referencedWorkflow) {
      shouldTerminate = true;
      return;
    }

    // Abort if circular reference is detected
    if (illegalReferences.includes(referencedWorkflow.id)) {
      shouldTerminate = true;
      return;
    }

    // Update list of visited references
    updatedIllegalReferences.push(referencedWorkflow.id);

    const referencedWorkflowOutput = referencedWorkflow.flow?.elements.find(
      (el) => el.type === NodeTypes.OUTPUT
    );

    const outputEdge = referencedWorkflow.flow?.elements.find(
      (el) =>
        referencedWorkflowOutput &&
        (el as Edge).target === referencedWorkflowOutput.id
    );

    const sourceEdges = transformedElements.filter(
      (el) => (el as Edge).source === ref.id
    ) as Edge[];

    if (!referencedWorkflowOutput || !outputEdge || !sourceEdges.length) {
      shouldTerminate = true;
      return;
    }

    // Remove source reference node
    transformedElements = removeElements([ref], transformedElements);

    // Edges to add (calc ref could have multiple edges connected to nodes)
    const edgesToAdd = sourceEdges.map((sourceEdge) => ({
      ...outputEdge,
      target: sourceEdge.target,
      targetHandle: sourceEdge.targetHandle,
    }));

    // Add nodes and edges from referenced calculation
    transformedElements.push(
      ...(referencedWorkflow.flow?.elements || []).filter(
        (el) => el.id !== referencedWorkflowOutput.id && el.id !== outputEdge.id
      ),
      ...edgesToAdd
    );
  });

  if (shouldTerminate) {
    return transformedElements;
  }

  return fillReferencedCalculations(
    workflows,
    transformedElements,
    updatedIllegalReferences
  );
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

const getParamsFromReactFlowNode = (
  settings: ChartWorkflowV2['settings'] = { autoAlign: true },
  node: FlowElement<NodeDataVariants>
) => {
  if (node.type !== NodeTypes.FUNCTION) {
    return {};
  }

  const functionNode = node as Node<FunctionNodeData>;

  let params = functionNode.data?.functionData || {};
  // Add auto-align parameter using the global setting
  if (
    functionNode.data?.toolFunction?.parameters?.some(
      (p: OperationParameters) => p.param === AUTO_ALIGN_PARAM
    )
  ) {
    params = { ...params, [AUTO_ALIGN_PARAM]: settings.autoAlign };
  }

  return params;
};

const getInputFromReactFlowNode = (node: FlowElement, nodes: FlowElement[]) => {
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
            ? (node as Node<SourceNodeData>).data?.selectedSourceId
            : '',
      };
    default:
      return { type: 'unknown', value: 'could not resolve' };
  }
};

export const getStepsFromWorkflowReactFlow = (
  workflow: ChartWorkflowV2,
  workflows: ChartWorkflowV2[] = []
): ComputationStep[] => {
  const { flow } = workflow;

  if (!flow) return [];

  const filteredElements = flow.elements.filter((node) => {
    switch (node.type) {
      case NodeTypes.CONSTANT:
      case NodeTypes.FUNCTION:
      case NodeTypes.OUTPUT:
      case NodeTypes.SOURCE:
        return (
          getIncomers(node as Node, flow.elements).length ||
          getOutgoers(node as Node, flow.elements).length
        );
      default:
        return true;
    }
  });

  const elements = fillReferencedCalculations(workflows, filteredElements, [
    workflow.id,
  ]);

  const outputNode = elements.find(
    (node) => node.type === NodeTypes.OUTPUT
  ) as Node;

  if (!outputNode || elements.length === 0) {
    return [];
  }

  const validNodes: Node[] = [outputNode];

  // traversing from output node and all incomers and add it to validNodes until none left.
  function findInputNodes(node: Node) {
    const incomers = getIncomers(node as Node, elements);
    incomers.forEach((n) => {
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
        parameters: getParamsFromReactFlowNode(workflow.settings, node),
      };
    });

  const steps = parsedValidNodes
    .map((node, i) => {
      const inputs =
        node.type === NodeTypes.FUNCTION
          ? (node as Node<FunctionNodeData>).data?.toolFunction?.inputs?.map(
              (inputSpecification) => {
                const connection = elements.find((el) => {
                  return (
                    isEdge(el) &&
                    el.target === node.id &&
                    el.targetHandle === inputSpecification.param
                  );
                });

                if (!connection) {
                  return undefined;
                }

                return elements.find(
                  ({ id }) => id === (connection as Edge).source
                ) as Node<any>;
              }
            )
          : node.incomers;

      const filteredInputNodes = (inputs || []).filter(Boolean) as Node<any>[];

      const filteredInputs = filteredInputNodes
        .map((incomer) => {
          return getInputFromReactFlowNode(incomer, parsedValidNodes);
        })
        .filter(Boolean);

      return {
        step: i,
        op: getOperationFromReactFlowNode(node),
        inputs: filteredInputs,
        ...(Object.keys(node.parameters).length
          ? { params: node.parameters }
          : {}),
      };
    })
    .filter(Boolean);

  return steps as ComputationStep[];
};
