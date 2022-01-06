/* eslint-disable no-continue */
import {
  DiagramConnection,
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
        symbolName: 'Line',
        pathIds: [pidPath.pathId],
        labelIds: [],
      } as DiagramLineInstance)
  );
  return potentialLines;
};

export const findLinesAndConnections = (
  pidDocument: PidDocument,
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  oldConnections: DiagramConnection[]
) => {
  const potentialLineInstanceList: DiagramLineInstance[] = getPotentialLines(
    symbolInstances,
    lineInstances,
    pidDocument
  );

  const connections: DiagramConnection[] = findConnections(
    symbolInstances,
    [...lineInstances, ...potentialLineInstanceList],
    pidDocument
  );

  const newLines = detectLines(
    potentialLineInstanceList,
    connections,
    lineInstances,
    symbolInstances
  );

  const knownInstances = [...symbolInstances, ...lineInstances, ...newLines];
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
  knownInstances: DiagramSymbolInstance[]
) => {
  return (
    isDiagramInstanceInList(connection.end, knownInstances) &&
    isDiagramInstanceInList(connection.start, knownInstances)
  );
};
