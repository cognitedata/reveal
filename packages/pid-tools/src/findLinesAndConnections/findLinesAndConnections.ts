/* eslint-disable no-continue */

import {
  DiagramConnection,
  DiagramInstanceWithPaths,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DocumentType,
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
  documentType: DocumentType
) => {
  const allInstances = [...symbolInstances, ...lineInstances];

  const pathIdsInInstances = new Set(
    allInstances.flatMap((instance) => instance.pathIds)
  );
  const isPathInAnyInstance = (path: PidPath) =>
    pathIdsInInstances.has(path.pathId);

  const isPathValidForDocumentType = (path: PidPath) =>
    documentType !== DocumentType.isometric ||
    path.segmentList.some(
      (pathSegment) => pathSegment.pathType === 'CurveSegment'
    ) === false;

  const isPathStrokeValid = (path: PidPath) =>
    documentType === DocumentType.isometric
      ? path.style?.strokeLinejoin === 'miter'
      : path.style?.stroke !== null;

  const matches = pidDocument.pidPaths.filter(
    (path) =>
      isPathValidForDocumentType(path) &&
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
  documentType: DocumentType,
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  oldConnections: DiagramConnection[]
): FindLinesAndConnectionsOutput => {
  const potentialLineInstanceList: DiagramLineInstance[] = getPotentialLines(
    symbolInstances,
    lineInstances,
    pidDocument,
    documentType
  );

  const relevantSymbolInstances = symbolInstances.filter(
    (symbolInstance) => symbolInstance.type !== 'Arrow'
  );

  const potentialConnections: DiagramConnection[] = findConnectionsByTraversal(
    relevantSymbolInstances,
    [...lineInstances, ...potentialLineInstanceList],
    pidDocument,
    documentType
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
