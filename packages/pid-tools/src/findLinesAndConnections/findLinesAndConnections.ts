/* eslint-disable no-continue */
import { AUTO_ANALYSIS_DISTANCE_THRESHOLD } from '../constants';
import {
  DiagramConnection,
  DiagramInstanceWithPaths,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DocumentType,
} from '../types';
import {
  connectionExists,
  getDiagramInstanceId,
  isDiagramInstanceInList,
  isPathIdInInstance,
} from '../utils';
import { PidDocument, PidGroup, PidPath } from '../pid';

import { findConnections } from './findConnections';
import { detectLines } from './findLines';

export const getOverlappingPidGroups = (
  pidGroups: PidGroup[],
  instance: PidGroup
) => {
  return pidGroups.filter((pidGroup) =>
    instance.isClose(pidGroup, AUTO_ANALYSIS_DISTANCE_THRESHOLD)
  );
};

export const getPotentialLines = (
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  pidDocument: PidDocument,
  documentType: DocumentType
) => {
  const allInstances = [...symbolInstances, ...lineInstances];

  const isPathInAnyInstance = (path: PidPath) =>
    !allInstances.some((diagramInstance) =>
      isPathIdInInstance(path.pathId, getDiagramInstanceId(diagramInstance))
    );

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
      isPathInAnyInstance(path) &&
      isPathStrokeValid(path)
  );

  const potentialLines: DiagramLineInstance[] = matches.map(
    (pidPath) =>
      ({
        type: 'Line',
        pathIds: [pidPath.pathId],
        labelIds: [],
        lineNumbers: [],
      } as DiagramLineInstance)
  );
  return potentialLines;
};

export interface FindLinesAndConnectionsOutput {
  newConnections: DiagramConnection[];
  lineInstances: DiagramLineInstance[];
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

  const connections: DiagramConnection[] = findConnections(
    relevantSymbolInstances,
    [...lineInstances, ...potentialLineInstanceList],
    pidDocument
  );

  const newLines = detectLines(
    potentialLineInstanceList,
    connections,
    lineInstances,
    relevantSymbolInstances
  );

  const knownInstances = [
    ...relevantSymbolInstances,
    ...lineInstances,
    ...newLines,
  ];
  const prunedConnections = connections.filter((con) =>
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
    lineInstances: newLines,
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
