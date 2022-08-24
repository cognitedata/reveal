import { ChartWorkflowV2 } from 'models/chart/types';
import {
  addEdge,
  Connection,
  Edge,
  Elements,
  FlowExportObject,
  FlowTransform,
  Node,
  removeElements,
  updateEdge,
} from 'react-flow-renderer';
import {
  NodeTypes,
  NodeDataDehydratedVariants,
  NodeDataVariants,
} from './types';
import { duplicateNode, updateNodeData, updatePosition } from './utils';

export const removeElementsFromFlow = (
  workflow: ChartWorkflowV2,
  elementsToRemove: Elements<NodeDataVariants>
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: removeElements(elementsToRemove, elements),
    },
  };
};

export const makeConnectionInFlow = (
  workflow: ChartWorkflowV2,
  connection: Edge | Connection
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  let elements = existingFlow?.elements ?? [];

  const isTargetSameAsSource = connection.source === connection.target;

  /**
   * You should not be able to connect
   * nodes to themselves
   */
  if (isTargetSameAsSource) {
    return workflow;
  }

  const existingConnection = elements.find(
    (el) =>
      (el as Edge).target === connection.target &&
      (el as Edge).targetHandle === connection.targetHandle
  ) as Edge;

  /**
   * Allow only a single connection
   * to each input (remove the existing one if applicable)
   */
  if (!existingConnection) {
    elements = addEdge(connection, elements);

    return {
      ...workflow,
      flow: {
        ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
        elements,
      },
    };
  }

  elements = updateEdge(existingConnection, connection as Connection, elements);

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements,
    },
  };
};

export const updateFlowEdge = (
  workflow: ChartWorkflowV2,
  oldEdge: Edge,
  newConnection: Connection
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: updateEdge(oldEdge, newConnection, elements),
    },
  };
};

export const updateNodePositionInFlow = (
  workflow: ChartWorkflowV2,
  node: Node<NodeDataVariants>
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: updatePosition(elements, node),
    },
  };
};

export const duplicateNodeInFlow = (
  workflow: ChartWorkflowV2,
  nodeId: string,
  newNodeId: string
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: duplicateNode(elements, nodeId, newNodeId),
    },
  };
};

export const removeNodeInFlow = (
  workflow: ChartWorkflowV2,
  nodeId: string
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  const elementsToRemove = elements.filter(
    (el) =>
      el.id === nodeId ||
      (el as Edge).target === nodeId ||
      (el as Edge).source === nodeId
  );

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: removeElements(
        elementsToRemove.filter((el) => el.type !== NodeTypes.OUTPUT),
        elements
      ),
    },
  };
};

export const updateSourceItemInFlow = (
  workflow: ChartWorkflowV2,
  nodeId: string,
  newSourceId: string,
  newType: string
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: updateNodeData(elements, nodeId, {
        selectedSourceId: newSourceId,
        type: newType,
      }),
    },
  };
};

export const updateParameterValuesInFlow = (
  workflow: ChartWorkflowV2,
  nodeId: string,
  parameterValues: { [key: string]: any }
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  const node = elements.find((el) => el.id === nodeId) as Node;

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: updateNodeData(elements, nodeId, {
        parameterValues: {
          ...node?.data?.parameterValues,
          ...parameterValues,
        },
      }),
    },
  };
};

export const updateConstantInFlow = (
  workflow: ChartWorkflowV2,
  nodeId: string,
  value: number
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: updateNodeData(elements, nodeId, { value }),
    },
  };
};

export const addNodeInFlow = (
  workflow: ChartWorkflowV2,
  newNode: Node<NodeDataDehydratedVariants>
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;
  const elements = existingFlow?.elements ?? [];

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      elements: elements.concat(newNode),
    },
  };
};

export const updateFlowPositionAndZoom = (
  workflow: ChartWorkflowV2,
  transform: FlowTransform
): ChartWorkflowV2 => {
  const existingFlow = workflow.flow;

  return {
    ...workflow,
    flow: {
      ...(existingFlow as FlowExportObject<NodeDataDehydratedVariants>),
      zoom: transform.zoom,
      position: [transform.x, transform.y],
    },
  };
};

export const updateFlowSettings = (
  workflow: ChartWorkflowV2,
  settings: ChartWorkflowV2['settings']
): ChartWorkflowV2 => {
  return {
    ...workflow,
    settings,
  };
};

export const updateWorkflowName = (
  workflow: ChartWorkflowV2,
  name: string
): ChartWorkflowV2 => {
  return {
    ...workflow,
    name,
  };
};
