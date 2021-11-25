import { DiagramSymbolInstance } from '@cognite/pid-tools';

export const getInstanceCount = (
  symbolInstances: DiagramSymbolInstance[],
  symbolName: string
) => {
  return symbolInstances.filter(
    (instance) => instance.symbolName === symbolName
  ).length;
};

export const getInstancesByName = (
  symbolInstances: DiagramSymbolInstance[],
  symbolName: string
) => {
  return symbolInstances.filter((instance) => {
    return instance.symbolName === symbolName;
  });
};
