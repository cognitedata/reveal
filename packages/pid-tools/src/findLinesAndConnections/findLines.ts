import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DiagramInstanceId,
} from '../types';
import { getDiagramInstanceId, isDiagramInstanceInList } from '../utils';

const getConnectedByInstanceId = (
  instanceId: DiagramInstanceId,
  connections: DiagramConnection[]
): DiagramInstanceId[] => {
  return connections
    .filter((con) => instanceId === con.end || instanceId === con.start)
    .map((con) => (con.end === instanceId ? con.start : con.end));
};

export const detectLines = (
  potentialLineInstanceList: DiagramLineInstance[],
  connections: DiagramConnection[],
  lineInstances: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[]
) => {
  const newLines: DiagramLineInstance[] = [];

  const potLineSegmentsWithConnections = potentialLineInstanceList.filter(
    (line) =>
      connections.some(
        (con) =>
          getDiagramInstanceId(line) === con.end ||
          getDiagramInstanceId(line) === con.start
      )
  );

  potLineSegmentsWithConnections.forEach((newPotLine) => {
    const { connectionCount, visitedLines } =
      dfsCountConnectionsToSymbolsOrLines(
        [...lineInstances, ...newLines],
        symbolInstances,
        connections,
        newPotLine
      );

    if (connectionCount >= 2) {
      const deduplicatedVisitedLines = [
        ...visitedLines,
        newPotLine.pathIds[0],
      ].filter(
        (visitedLine) =>
          !newLines.some((line) => line.pathIds[0] === visitedLine)
      );
      newLines.push(
        ...deduplicatedVisitedLines.map(
          (newLine) =>
            ({
              pathIds: [newLine],
              symbolId: 'Line',
              labelIds: [],
            } as DiagramLineInstance)
        )
      );
    }
  });

  return newLines;
};

const dfsCountConnectionsToSymbolsOrLines = (
  lineInstances: DiagramLineInstance[],
  symbolInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  potentialLine: DiagramLineInstance
) => {
  const instanceId = getDiagramInstanceId(potentialLine);

  const visited = [instanceId];
  const newLinesFound: string[] = [];

  let matchCount = 0;
  const connectedInstances = getConnectedByInstanceId(instanceId, connections);
  const knownInstances = [...lineInstances, ...symbolInstances];

  connectedInstances.forEach((diagramInstanceId) => {
    const newLinesVisited = findLinesInBetweenKnownInstances(
      diagramInstanceId,
      knownInstances,
      connections,
      visited
    );

    if (newLinesVisited !== null) {
      newLinesFound.push(...newLinesVisited);
      matchCount += 1;
    }
  });

  return { connectionCount: matchCount, visitedLines: newLinesFound };
};

const findLinesInBetweenKnownInstances = (
  instanceId: DiagramInstanceId,
  knownInstances: DiagramSymbolInstance[],
  connections: DiagramConnection[],
  visited: DiagramInstanceId[]
): DiagramInstanceId[] | null => {
  if (visited.includes(instanceId)) {
    return null;
  }
  visited.push(instanceId);

  if (isDiagramInstanceInList(instanceId, knownInstances)) {
    return [];
  }
  const connectedInstances = getConnectedByInstanceId(instanceId, connections);

  for (let i = 0; i < connectedInstances.length; i++) {
    const newLines = findLinesInBetweenKnownInstances(
      connectedInstances[i],
      knownInstances,
      connections,
      visited
    );

    if (newLines !== null) {
      newLines.push(instanceId);
      return newLines;
    }
  }
  return null;
};
