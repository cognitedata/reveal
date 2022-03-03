import { Operation, OperationVersions } from '@cognite/calculation-backend';
import { ChartWorkflowV2 } from 'models/chart/types';
import { Elements, FlowElement, Node } from 'react-flow-renderer';
import {
  NodeTypes,
  SourceOption,
  NodeDataVariants,
  NodeDataDehydratedVariants,
  NodeCallbacks,
} from './types';
import { transformParamInput } from './transforms';
import { FUNCTION_NODE_DRAG_HANDLE_CLASSNAME } from './constants';
import {
  ConstantNodeData,
  ConstantNodeDataDehydrated,
} from './Nodes/ConstantNode';
import {
  FunctionNodeData,
  FunctionNodeDataDehydrated,
} from './Nodes/FunctionNode/FunctionNode';
import { OutputNodeData, OutputNodeDataDehydrated } from './Nodes/OutputNode';
import { SourceNodeData, SourceNodeDataDehydrated } from './Nodes/SourceNode';

export const updatePosition = (
  els: Elements<NodeDataDehydratedVariants>,
  node: Node<NodeDataDehydratedVariants>
): Elements => {
  return els.map((el) => {
    if (el.id === node.id) {
      return {
        ...el,
        position: node.position,
      };
    }
    return el;
  });
};

export const updateNodeData = (
  els: Elements<NodeDataDehydratedVariants>,
  nodeId: string,
  diff: any
): Elements => {
  return els.map((el) => {
    if (el.id === nodeId) {
      return {
        ...el,
        data: {
          ...el.data,
          ...diff,
        },
      };
    }
    return el;
  });
};

export const getDuplicatedNode = (
  els: Elements<NodeDataDehydratedVariants>,
  nodeId: string,
  newNodeId: string
): FlowElement<NodeDataDehydratedVariants> | undefined => {
  const elementToDuplicate = els.find((el) => el.id === nodeId) as Node;
  if (!elementToDuplicate) {
    return undefined;
  }
  return {
    ...elementToDuplicate,
    id: newNodeId,
    position: {
      x: elementToDuplicate.position.x + 50,
      y: elementToDuplicate.position.y + 50,
    },
  };
};

export const duplicateNode = (
  els: Elements<NodeDataDehydratedVariants>,
  nodeId: string,
  newNodeId: string
) => {
  const elementToDuplicate = els.find((el) => el.id === nodeId) as Node;
  if (!elementToDuplicate) {
    return els;
  }
  return els.concat({
    ...elementToDuplicate,
    id: newNodeId,
    position: {
      x: elementToDuplicate.position.x + 50,
      y: elementToDuplicate.position.y + 50,
    },
  });
};

export const initializeParameterValues = (
  operationVersion: OperationVersions
): { [key: string]: any } => {
  let parameterValues = {};
  operationVersion.parameters.forEach(
    ({ param, type, default_value: _default }) => {
      if (_default) {
        parameterValues = {
          ...parameterValues,
          [param]: transformParamInput(type, _default),
        };
      }
    }
  );
  return parameterValues;
};

export const rehydrateStoredFlow = (
  workflow: ChartWorkflowV2,
  sources: SourceOption[],
  operations: Operation[],
  callbacks: NodeCallbacks,
  readOnly: boolean
): Elements<NodeDataVariants> => {
  if (workflow?.version !== 'v2') {
    return [];
  }

  const { flow } = workflow;

  if (!flow) {
    return [];
  }

  const {
    onSourceItemChange,
    onConstantChange,
    onParameterValuesChange,
    onOutputNameChange,
    onDuplicateNode,
    onRemoveNode,
  } = callbacks;

  const outputElements: Elements<NodeDataVariants> = flow.elements.map((el) => {
    switch (el.type) {
      case NodeTypes.SOURCE:
        return {
          ...(el as FlowElement<SourceNodeDataDehydrated>),
          data: {
            ...el.data,
            sourceOptions: sources,
            onSourceItemChange,
            onDuplicateNode,
            onRemoveNode,
            readOnly,
          } as SourceNodeData,
        };
      case NodeTypes.CONSTANT:
        return {
          ...(el as FlowElement<ConstantNodeDataDehydrated>),
          data: {
            ...el.data,
            onConstantChange,
            onDuplicateNode,
            onRemoveNode,
            readOnly,
          } as ConstantNodeData,
        };
      case NodeTypes.FUNCTION:
        return {
          ...(el as FlowElement<FunctionNodeDataDehydrated>),
          dragHandle: `.${FUNCTION_NODE_DRAG_HANDLE_CLASSNAME}`,
          data: {
            ...el.data,
            onParameterValuesChange,
            onDuplicateNode,
            onRemoveNode,
            operation: operations.find(
              ({ op }) =>
                (el.data as FunctionNodeDataDehydrated).selectedOperation.op ===
                op
            ),
            readOnly,
          } as FunctionNodeData,
        };
      case NodeTypes.OUTPUT:
        return {
          ...(el as FlowElement<OutputNodeDataDehydrated>),
          data: {
            ...el.data,
            name: workflow.name,
            color: workflow.color,
            onOutputNameChange,
            readOnly,
          } as OutputNodeData,
        };
      default:
        return el as FlowElement<NodeDataVariants>;
    }
  });

  return outputElements;
};

export const getOutputNodePosition = (element?: HTMLDivElement | null) => {
  return element
    ? {
        x: element.getBoundingClientRect().width - 250,
        y: element.getBoundingClientRect().height / 2,
      }
    : {
        x: 1000,
        y: 200,
      };
};
