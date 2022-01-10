import {
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramConnection,
  DiagramLineInstance,
  getDiagramInstanceId,
  isConnectionUnidirectionalMatch,
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
    .filter((instance) => instance.symbolId === diagramSymbol.id)
    .map((instance) => instance.pathIds.join('-'));

  const connectionsToKeep = connections.filter((connection) => {
    return !(
      instancesToRemove.includes(connection.end) ||
      instancesToRemove.includes(connection.start)
    );
  });
  setConnections(connectionsToKeep);

  const symbolInstancesToKeep = symbolInstances.filter(
    (instance) => instance.symbolId !== diagramSymbol.id
  );
  setSymbolInstances(symbolInstancesToKeep);

  const symbolsToKeep = symbols.filter(
    (symbol) => symbol.id !== diagramSymbol.id
  );
  setSymbols(symbolsToKeep);
};

export const deleteLineFromState = (
  line: DiagramLineInstance,
  lineInstances: DiagramLineInstance[],
  connections: DiagramConnection[],
  setConnections: (diagramConnections: DiagramConnection[]) => void,
  setLines: (diagramLineInstances: DiagramLineInstance[]) => void
) => {
  const lineInstanceId = getDiagramInstanceId(line);
  setConnections(
    connections.filter(
      (connection) =>
        connection.start !== lineInstanceId && connection.end !== lineInstanceId
    )
  );
  setLines(
    lineInstances.filter(
      (lineInstance) => getDiagramInstanceId(lineInstance) !== lineInstanceId
    )
  );
};

export const deleteConnectionFromState = (
  diagramConnection: DiagramConnection,
  diagramConnections: DiagramConnection[],
  setConnections: (connections: DiagramConnection[]) => void
) => {
  setConnections(
    diagramConnections.filter(
      (connection) =>
        !isConnectionUnidirectionalMatch(diagramConnection, connection)
    )
  );
};

export const getSymbolByTypeAndDescription = (
  symbols: DiagramSymbol[],
  symbolType: string,
  description: string
): DiagramSymbol | undefined => {
  return symbols.find(
    (symbol) =>
      symbol.symbolType === symbolType && symbol.description === description
  );
};
