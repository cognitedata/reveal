import { Operation } from '@cognite/calculation-backend';
import { NodeTypes } from 'models/node-editor/types';
import { Elements, FlowExportObject, Node } from 'react-flow-renderer';
import { transformParamInput } from 'utils/transforms';

export const updatePosition = (els: Elements, node: Node): Elements => {
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
  els: Elements,
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

export const duplicateNode = (
  els: Elements,
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

export const initializeFunctionData = (
  toolFunction: Operation
): { [key: string]: any } => {
  let functionData = {};
  toolFunction.parameters.forEach(
    ({ param, type, default_value: _default }) => {
      if (_default) {
        functionData = {
          ...functionData,
          [param]: transformParamInput(type, _default),
        };
      }
    }
  );
  return functionData;
};

export const restoreSavedFlow = (
  flow: FlowExportObject,
  callbacks: Record<string, Function | undefined>,
  outputColor: string
): Elements => {
  const {
    onSourceItemChange,
    onConstantChange,
    onFunctionDataChange,
    onOutputNameChange,
    saveOutputName,
    onDuplicateNode,
    onRemoveNode,
  } = callbacks;

  return flow.elements.map((el) => {
    switch (el.type) {
      case NodeTypes.SOURCE:
        return {
          ...el,
          data: {
            ...el.data,
            onSourceItemChange,
            onDuplicateNode,
            onRemoveNode,
          },
        };
      case NodeTypes.CONSTANT:
        return {
          ...el,
          data: { ...el.data, onConstantChange, onDuplicateNode, onRemoveNode },
        };
      case NodeTypes.FUNCTION:
        return {
          ...el,
          data: {
            ...el.data,
            onFunctionDataChange,
            onDuplicateNode,
            onRemoveNode,
          },
        };
      case NodeTypes.OUTPUT:
        return {
          ...el,
          data: {
            ...el.data,
            saveOutputName,
            onOutputNameChange,
            color: outputColor,
          },
        };
      default:
        return el;
    }
  });
};
