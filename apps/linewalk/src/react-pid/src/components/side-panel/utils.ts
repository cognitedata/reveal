import { DiagramSymbolInstance } from '@cognite/pid-tools';

export const getInstancesBySymbolId = (
  symbolInstances: DiagramSymbolInstance[],
  symbolId: string
) => {
  return symbolInstances.filter((instance) => {
    return instance.symbolId === symbolId;
  });
};
