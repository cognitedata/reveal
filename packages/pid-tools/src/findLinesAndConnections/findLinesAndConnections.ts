/* eslint-disable no-continue */
import {
  DiagramConnection,
  DiagramInstance,
  DiagramLineInstance,
  DiagramSymbolInstance,
} from '../types';
import {
  connectionExists,
  getDiagramInstanceId,
  isDiagramInstanceInList,
  isPathIdInInstance,
} from '../utils';
import { PidDocument, PidGroup } from '../pid';

import { findConnections } from './findConnections';
import { detectLines } from './findLines';

export const getOverlappingPidGroups = (
  pidGroups: PidGroup[],
  instance: PidGroup
) => {
  return pidGroups.filter((pidGroup) => instance.isOverlap(pidGroup));
};

export const getPotentialLines = (
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  pidDocument: PidDocument
) => {
  const allInstances = [...symbolInstances, ...lineInstances];

  const matches = pidDocument.pidPaths.filter(
    (path) =>
      !allInstances.some((diagramInstance) =>
        isPathIdInInstance(path.pathId, getDiagramInstanceId(diagramInstance))
      )
  );
  const potentialLines: DiagramLineInstance[] = matches.map(
    (pidPath) =>
      ({
        type: 'Line',
        pathIds: [pidPath.pathId],
        labelIds: [],
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
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  oldConnections: DiagramConnection[]
): FindLinesAndConnectionsOutput => {
  const potentialLineInstanceList: DiagramLineInstance[] = getPotentialLines(
    symbolInstances,
    lineInstances,
    pidDocument
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
  knownInstances: DiagramInstance[]
) => {
  return (
    isDiagramInstanceInList(connection.end, knownInstances) &&
    isDiagramInstanceInList(connection.start, knownInstances)
  );
};
