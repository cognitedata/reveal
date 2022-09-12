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
  isDiagramIdInList,
} from '../utils';
import { PidDocument, PidPath } from '../pid';

import { findConnectionsByTraversal } from './findConnections';
import { detectLines } from './findLines';

const getPotentialLines = ({
  symbolInstances,
  oldLines,
  manuallyRemovedLines,
  pidDocument,
  diagramType,
}: {
  symbolInstances: DiagramSymbolInstance[];
  oldLines: DiagramLineInstance[];
  manuallyRemovedLines: DiagramLineInstance[];
  pidDocument: PidDocument;
  diagramType: DiagramType;
}): DiagramLineInstance[] => {
  const isPathValidForDiagramType = (path: PidPath) =>
    diagramType !== DiagramType.ISO ||
    path.segmentList.some(
      (pathSegment) => pathSegment.pathType === 'CurveSegment'
    ) === false;

  const isPathStrokeValid = (path: PidPath) =>
    diagramType === DiagramType.ISO
      ? path.style?.strokeLinejoin === 'miter'
      : path.style?.stroke !== null;

  const allInstancesPathIds = new Set(
    [...symbolInstances, ...oldLines].flatMap((instance) => instance.pathIds)
  );

  const manuallyRemovedLinesPathIds = new Set(
    manuallyRemovedLines.flatMap((instance) => instance.pathIds)
  );

  const potentialPidPaths = pidDocument.pidPaths.filter(
    (path) =>
      isPathValidForDiagramType(path) &&
      isPathStrokeValid(path) &&
      !allInstancesPathIds.has(path.pathId) &&
      !manuallyRemovedLinesPathIds.has(path.pathId)
  );

  return potentialPidPaths.map((pidPath) => {
    const potentialLine: DiagramLineInstance = {
      id: getDiagramInstanceIdFromPathIds([pidPath.pathId]),
      type: 'Line',
      pathIds: [pidPath.pathId],
      labelIds: [],
      lineNumbers: [],
      inferedLineNumbers: [],
    };
    return potentialLine;
  });
};

const connectsToKnownInstances = (
  connection: DiagramConnection,
  knownInstances: DiagramInstanceWithPaths[]
) => {
  return (
    isDiagramIdInList(connection.end, knownInstances) &&
    isDiagramIdInList(connection.start, knownInstances)
  );
};

export interface FindLinesAndConnectionsArgs {
  diagramType: DiagramType;
  symbolInstances: DiagramSymbolInstance[];
  oldLines: DiagramLineInstance[];
  manuallyRemovedLines: DiagramLineInstance[];
  oldConnections: DiagramConnection[];
}

export const findLinesAndConnections = (
  pidDocument: PidDocument,
  {
    diagramType,
    symbolInstances,
    oldLines,
    manuallyRemovedLines,
    oldConnections,
  }: FindLinesAndConnectionsArgs
): {
  newLines: DiagramLineInstance[];
  newAndOldConnections: DiagramConnection[];
} => {
  const potentialLines: DiagramLineInstance[] = getPotentialLines({
    symbolInstances,
    oldLines,
    manuallyRemovedLines,
    pidDocument,
    diagramType,
  });

  const relevantSymbolInstances = symbolInstances.filter(
    (symbolInstance) => symbolInstance.type !== 'Arrow'
  );

  // eslint-disable-next-line no-console
  console.log('Finding connections by traversal...');
  const potentialConnections: DiagramConnection[] = findConnectionsByTraversal(
    relevantSymbolInstances,
    [...oldLines, ...potentialLines],
    pidDocument
  );

  // eslint-disable-next-line no-console
  console.log('Pruning lines...');
  const newLines = detectLines(
    potentialLines,
    potentialConnections,
    oldLines,
    relevantSymbolInstances
  );

  const knownInstances = [...relevantSymbolInstances, ...oldLines, ...newLines];

  const newConnections = potentialConnections.filter((con) =>
    connectsToKnownInstances(con, knownInstances)
  );

  const newAndOldConnections = [...oldConnections];
  // eslint-disable-next-line no-restricted-syntax
  for (const newConnection of newConnections) {
    // FIX: Use a different data structure to not do this in linear time?
    if (!connectionExists(newAndOldConnections, newConnection)) {
      newAndOldConnections.push(newConnection);
    }
  }

  return {
    newLines,
    newAndOldConnections,
  };
};
