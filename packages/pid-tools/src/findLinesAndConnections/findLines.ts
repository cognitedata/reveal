import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramInstanceId,
  DiagramSymbolInstance,
} from '../types';

const getConnectedByInstanceId = (
  instanceId: DiagramInstanceId,
  connections: DiagramConnection[]
): DiagramInstanceId[] => {
  return connections
    .filter((con) => instanceId === con.end || instanceId === con.start)
    .map((con) => (con.end === instanceId ? con.start : con.end));
};

export const detectLines = (
  potentialLines: DiagramLineInstance[],
  connections: DiagramConnection[],
  lines: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[]
) => {
  const potentialLinesWithConnection = potentialLines.filter((line) =>
    connections.some(
      (connection) => line.id === connection.end || line.id === connection.start
    )
  );

  const knownInstanceIds = new Set<DiagramInstanceId>();
  [...symbolInstances, ...lines].forEach((instance) => {
    knownInstanceIds.add(instance.id);
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const potentialLine of potentialLinesWithConnection) {
    if (
      hasMoreThanOneNonOverlappingPathToKnownInstances(
        potentialLine.id,
        knownInstanceIds,
        connections
      )
    ) {
      knownInstanceIds.add(potentialLine.id);
    }
  }

  const newLines = potentialLinesWithConnection.filter((potentialLine) =>
    knownInstanceIds.has(potentialLine.id)
  );
  return newLines;
};

const hasMoreThanOneNonOverlappingPathToKnownInstances = (
  potentialInstance: DiagramInstanceId,
  knownInstances: Set<DiagramInstanceId>,
  connections: DiagramConnection[]
) => {
  const visited = new Set<DiagramInstanceId>();
  visited.add(potentialInstance);

  let numNonOverlappingPaths = 0;

  const neighbours = getConnectedByInstanceId(potentialInstance, connections);
  // eslint-disable-next-line no-restricted-syntax
  for (const neighbour of neighbours) {
    const isUniquePath = hasNonOverlappingPathToKnownInstances(
      neighbour,
      knownInstances,
      connections,
      visited
    );

    if (isUniquePath) {
      numNonOverlappingPaths += 1;
      if (numNonOverlappingPaths > 1) {
        return true;
      }
    }
  }

  return false;
};

const hasNonOverlappingPathToKnownInstances = (
  instanceId: DiagramInstanceId,
  knownInstances: Set<DiagramInstanceId>,
  connections: DiagramConnection[],
  visited: Set<DiagramInstanceId>
): boolean => {
  if (visited.has(instanceId)) {
    return false;
  }
  visited.add(instanceId);

  if (knownInstances.has(instanceId)) {
    return true;
  }

  const connectedInstances = getConnectedByInstanceId(instanceId, connections);

  // eslint-disable-next-line no-restricted-syntax
  for (const connectedInstance of connectedInstances) {
    const isUniquePathFromNeighbour = hasNonOverlappingPathToKnownInstances(
      connectedInstance,
      knownInstances,
      connections,
      visited
    );

    if (isUniquePathFromNeighbour) {
      return true;
    }
  }

  return false;
};
