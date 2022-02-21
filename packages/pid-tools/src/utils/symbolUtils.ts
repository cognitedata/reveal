import {
  DiagramSymbol,
  DiagramConnection,
  getDiagramInstanceId,
  DiagramInstanceWithPaths,
} from '../index';

export const connectionHasInstanceId = (
  instanceId: string,
  connection: DiagramConnection
) => {
  return connection.start === instanceId || connection.end === instanceId;
};

export const getConnectionsWithoutInstances = (
  instances: DiagramInstanceWithPaths[],
  connections: DiagramConnection[]
) => {
  const instanceIds = instances.map((instance) =>
    getDiagramInstanceId(instance)
  );

  return connections.filter(
    (connection) =>
      instanceIds.some((lineInstanceId) =>
        connectionHasInstanceId(lineInstanceId, connection)
      ) === false
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
