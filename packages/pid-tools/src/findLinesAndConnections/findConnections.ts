/* eslint-disable no-continue */
import { PidDocument, PidGroup } from '../pid';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbolInstance,
  DocumentType,
} from '../types';

import { getOverlappingPidGroups } from './findLinesAndConnections';

export const findConnections = (
  symbolInstances: DiagramSymbolInstance[],
  lineInstances: DiagramLineInstance[],
  pidDocument: PidDocument,
  documentType: DocumentType
) => {
  const newConnections: DiagramConnection[] = [];

  const symbols = symbolInstances.map((diagramInstance) =>
    PidGroup.fromDiagramInstance(pidDocument, diagramInstance)
  );

  const linesToVisit = lineInstances.map((diagramInstance) =>
    PidGroup.fromDiagramInstance(pidDocument, diagramInstance)
  );

  const toVisit: PidGroup[] = [...symbols];
  const hasVisited: PidGroup[] = [];

  while (toVisit.length !== 0) {
    const potentialInstance = toVisit.pop();
    if (
      potentialInstance === undefined ||
      hasVisited.includes(potentialInstance)
    ) {
      continue;
    }
    hasVisited.push(potentialInstance);

    const overlappingPidGroups = getOverlappingPidGroups(
      linesToVisit,
      potentialInstance,
      documentType
    );

    overlappingPidGroups.forEach((overlappingPidGroup) => {
      if (
        potentialInstance.diagramInstanceId !==
        overlappingPidGroup.diagramInstanceId
      ) {
        if (!hasVisited.includes(overlappingPidGroup)) {
          toVisit.push(overlappingPidGroup);
        }
        newConnections.push({
          start: potentialInstance.diagramInstanceId,
          end: overlappingPidGroup.diagramInstanceId,
          direction: 'unknown',
        });
      }
    });
  }
  return newConnections;
};
