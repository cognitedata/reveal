import {
  DiagramConnection,
  DiagramInstanceId,
  DiagramSymbolInstance,
} from '../types';

export const getDiagramInstanceId = (
  symbolInstance: DiagramSymbolInstance
): DiagramInstanceId => {
  return symbolInstance.pathIds.sort().join('-');
};

export const getSymbolInstanceByPathId = (
  symbolInstances: DiagramSymbolInstance[],
  pathId: string
): DiagramSymbolInstance | null => {
  const symbolInstance = symbolInstances.filter((symbolInstance) =>
    symbolInstance.pathIds.includes(pathId)
  );
  if (symbolInstance.length > 0) {
    return symbolInstance[0];
  }
  return null;
};

export const isPathIdInInstance = (
  pathId: string,
  instanceId: DiagramInstanceId | null
) => {
  return instanceId !== null && instanceId.split('-').includes(pathId);
};

export const connectionExists = (
  connections: DiagramConnection[],
  newConnection: DiagramConnection
) => {
  return connections.some(
    (connection) =>
      (connection.start === newConnection.start &&
        connection.end === newConnection.end) ||
      (connection.start === newConnection.end &&
        connection.end === newConnection.start)
  );
};
