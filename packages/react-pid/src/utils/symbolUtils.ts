import {
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramConnection,
} from '@cognite/pid-tools';

export const deleteSymbolFromState = (
  diagramSymbol: DiagramSymbol,
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  setConnections: (diagramConnections: DiagramConnection[]) => void,
  setSymbolInstances: (diagramSymbolInstances: DiagramSymbolInstance[]) => void,
  setSymbols: (diagramSymbols: DiagramSymbol[]) => void,
  symbols: DiagramSymbol[]
) => {
  const instancesToRemove = symbolInstances
    .filter((instance) => instance.symbolName === diagramSymbol.symbolName)
    .map((instance) => instance.pathIds.join('-'));

  const connectionsToKeep = connections.filter((connection) => {
    return !(
      instancesToRemove.includes(connection.end) ||
      instancesToRemove.includes(connection.start)
    );
  });
  setConnections(connectionsToKeep);

  const symbolInstancesToKeep = symbolInstances.filter(
    (instance) => instance.symbolName !== diagramSymbol.symbolName
  );
  setSymbolInstances(symbolInstancesToKeep);

  const symbolsToKeep = symbols.filter(
    (symbol) => symbol.symbolName !== diagramSymbol.symbolName
  );
  setSymbols(symbolsToKeep);
};

export const getSymbolByName = (
  symbols: DiagramSymbol[],
  symbolName: string
): DiagramSymbol | undefined => {
  return symbols.find((symbol) => symbol.symbolName === symbolName);
};
