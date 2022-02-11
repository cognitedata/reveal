import { DiagramSymbolInstance, DiagramSymbol } from '@cognite/pid-tools';

export const getInstanceCount = (
  symbolInstances: DiagramSymbolInstance[],
  symbol: DiagramSymbol
) => {
  return getInstancesBySymbolId(symbolInstances, symbol.id).length;
};

export const getInstancesBySymbolId = (
  symbolInstances: DiagramSymbolInstance[],
  symbolId: string
) => {
  return symbolInstances.filter((instance) => {
    return instance.symbolId === symbolId;
  });
};
