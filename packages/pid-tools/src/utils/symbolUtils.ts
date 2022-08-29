import { DiagramConnection, DiagramInstanceWithPaths } from '../index';

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
  const instanceIds = new Set(instances.map((instance) => instance.id));

  return connections.filter(
    (connection) =>
      !instanceIds.has(connection.start) && !instanceIds.has(connection.end)
  );
};
