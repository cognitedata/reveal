/* eslint-disable no-continue */

import {
  DiagramConnection,
  DiagramInstanceWithPaths,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DiagramType,
} from '../types';
import {
  connectionExists,
  getDiagramInstanceIdFromPathIds,
  isDiagramInstanceInList,
} from '../utils';
import { PidDocument, PidPath } from '../pid';

import { findConnectionsByTraversal } from './findConnections';
import { detectLines } from './findLines';

export const getPotentialLines = (
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  pidDocument: PidDocument,
  diagramType: DiagramType
) => {
  const allInstances = [...symbolInstances, ...lineInstances];

  const pathIdsInInstances = new Set(
    allInstances.flatMap((instance) => instance.pathIds)
  );
  const isPathInAnyInstance = (path: PidPath) =>
    pathIdsInInstances.has(path.pathId);

  const isPathValidForDiagramType = (path: PidPath) =>
    diagramType !== DiagramType.ISO ||
    path.segmentList.some(
      (pathSegment) => pathSegment.pathType === 'CurveSegment'
    ) === false;

  const isPathStrokeValid = (path: PidPath) =>
    diagramType === DiagramType.ISO
      ? path.style?.strokeLinejoin === 'miter'
      : path.style?.stroke !== null;

  const matches = pidDocument.pidPaths.filter(
    (path) =>
      isPathValidForDiagramType(path) &&
      !isPathInAnyInstance(path) &&
      isPathStrokeValid(path)
  );

  const potentialLines: DiagramLineInstance[] = matches.map(
    (pidPath) =>
      ({
        id: getDiagramInstanceIdFromPathIds([pidPath.pathId]),
        type: 'Line',
        pathIds: [pidPath.pathId],
        labelIds: [],
        lineNumbers: [],
        inferedLineNumbers: [],
      } as DiagramLineInstance)
  );
  return potentialLines;
};

export interface FindLinesAndConnectionsOutput {
  newConnections: DiagramConnection[];
  newLines: DiagramLineInstance[];
}

export const findLinesAndConnections = (
  pidDocument: PidDocument,
  diagramType: DiagramType,
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  oldConnections: DiagramConnection[]
): FindLinesAndConnectionsOutput => {
  const potentialLineInstanceList: DiagramLineInstance[] = getPotentialLines(
    symbolInstances,
    lineInstances,
    pidDocument,
    diagramType
  );

  const relevantSymbolInstances = symbolInstances.filter(
    (symbolInstance) => symbolInstance.type !== 'Arrow'
  );

  const potentialConnections: DiagramConnection[] = findConnectionsByTraversal(
    relevantSymbolInstances,
    [...lineInstances, ...potentialLineInstanceList],
    pidDocument,
    diagramType
  );

  const newLines = detectLines(
    potentialLineInstanceList,
    potentialConnections,
    lineInstances,
    relevantSymbolInstances
  );

  const knownInstances = [
    ...relevantSymbolInstances,
    ...lineInstances,
    ...newLines,
  ];
  const prunedConnections = potentialConnections.filter((con) =>
    connectsToKnownInstances(con, knownInstances)
  );

  const prunedNewConnections = [...oldConnections];
  for (let i = 0; i < prunedConnections.length; i++) {
    if (!connectionExists(prunedNewConnections, prunedConnections[i])) {
      prunedNewConnections.push(prunedConnections[i]);
    }
  }

  return {
    newConnections: prunedNewConnections,
    newLines,
  };
};

const connectsToKnownInstances = (
  connection: DiagramConnection,
  knownInstances: DiagramInstanceWithPaths[]
) => {
  return (
    isDiagramInstanceInList(connection.end, knownInstances) &&
    isDiagramInstanceInList(connection.start, knownInstances)
  );
};
