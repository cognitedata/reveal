/* eslint-disable no-continue */
import {
  AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO,
  AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID,
} from '../constants';
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
  getDiagramInstanceIdFromPathIds,
  isDiagramInstanceInList,
  isPathIdInInstance,
} from '../utils';
import { PidDocument, PidGroup, PidPath } from '../pid';

import { findConnections } from './findConnections';
import { detectLines } from './findLines';

export const getOverlappingPidGroups = (
  pidGroups: PidGroup[],
  instance: PidGroup,
  documentType: DocumentType
) => {
  const threshold =
    documentType === DocumentType.pid
      ? AUTO_ANALYSIS_DISTANCE_THRESHOLD_PID
      : AUTO_ANALYSIS_DISTANCE_THRESHOLD_ISO;
  return pidGroups.filter((pidGroup) => instance.isClose(pidGroup, threshold));
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

  const connections: DiagramConnection[] = findConnections(
    relevantSymbolInstances,
    [...lineInstances, ...potentialLineInstanceList],
    pidDocument,
    documentType
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
