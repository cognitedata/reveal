import { Operation } from '@cognite/calculation-backend';
import { NodeTypes } from 'models/node-editor/types';
import { Elements, FlowExportObject } from 'react-flow-renderer';
import { transformParamInput } from 'utils/transforms';

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
  callbacks: Record<string, Function | undefined>
): Elements => {
  const {
    onSourceItemChange,
    onConstantChange,
    onFunctionDataChange,
    onOutputNameChange,
    saveOutputName,
  } = callbacks;

  return flow.elements.map((el) => {
    switch (el.type) {
      case NodeTypes.SOURCE:
        return {
          ...el,
          data: {
            ...el.data,
            onSourceItemChange,
          },
        };
      case NodeTypes.CONSTANT:
        return {
          ...el,
          data: { ...el.data, onConstantChange },
        };
      case NodeTypes.FUNCTION:
        return {
          ...el,
          data: {
            ...el.data,
            onFunctionDataChange,
          },
        };
      case NodeTypes.OUTPUT:
        return {
          ...el,
          data: {
            ...el.data,
            saveOutputName,
            onOutputNameChange,
          },
        };
      default:
        return el;
    }
  });
};
