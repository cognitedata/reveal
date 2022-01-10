import { DiagramSymbolInstance, DiagramSymbol } from '@cognite/pid-tools';

export const getInstanceCount = (
  symbolInstances: DiagramSymbolInstance[],
  symbol: DiagramSymbol
) => {
  return getInstancesBySymbol(symbolInstances, symbol).length;
};

export const getInstancesBySymbol = (
  symbolInstances: DiagramSymbolInstance[],
  symbol: DiagramSymbol
) => {
  return symbolInstances.filter((instance) => {
    return instance.symbolId === symbol.id;
  });
};
