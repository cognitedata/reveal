/* eslint-disable no-continue */
import { GraphOutputFormat } from '../graph/types';
import {
  DiagramInstanceId,
  DiagramInstanceOutputFormat,
  DiagramSymbolInstanceOutputFormat,
} from '../types';
import { isEquipment, isInstrument } from '../utils';
import { calculateShortestPaths, PathOutputFormat } from '../graph';

import {
  getEditDistanceBetweenPaths,
  getOptimalEditDistanceMapping,
} from './editDistance';

export interface CrossDocumentConnection {
  pidInstanceId: DiagramInstanceId;
  isoInstanceId: DiagramInstanceId;
}

export const isCrossConnection = (
  pidInstance: DiagramInstanceOutputFormat,
  isoInstance: DiagramInstanceOutputFormat
) => {
  if (isInstrument(pidInstance) && isInstrument(isoInstance)) {
    if (pidInstance.labels.length !== isoInstance.labels.length) return false;

    const pidLabelTexts = pidInstance.labels.flatMap((label) => label.text);
    const isoLabelTexts = isoInstance.labels.flatMap((label) => label.text);

    for (let i = 0; i < pidLabelTexts.length; i++) {
      if (!isoLabelTexts.includes(pidLabelTexts[i])) return false;
    }
    return true;
  }
  if (isEquipment(pidInstance) && isEquipment(isoInstance)) {
    return (
      pidInstance.equipmentTag &&
      pidInstance.equipmentTag === isoInstance.equipmentTag
    );
  }
  return false;
};

export const getUniqueCrossConnections = (
  pidSymbolInstances: DiagramSymbolInstanceOutputFormat[],
  isoSymbolInstances: DiagramSymbolInstanceOutputFormat[]
): CrossDocumentConnection[] => {
  const crossDocumentConnections: CrossDocumentConnection[] = [];
  for (let i = 0; i < pidSymbolInstances.length; i++) {
    const pidInstance = pidSymbolInstances[i];

    const isoInstancesWithAssetExternalId = isoSymbolInstances.filter(
      (isoInstance) => isCrossConnection(pidInstance, isoInstance)
    );
    if (isoInstancesWithAssetExternalId.length === 1) {
      crossDocumentConnections.push({
        pidInstanceId: pidInstance.id,
        isoInstanceId: isoInstancesWithAssetExternalId[0].id,
      });
    }
  }
  return crossDocumentConnections;
};

export const matchGraphs = (
  pidGraph: GraphOutputFormat,
  isoGraph: GraphOutputFormat
) => {
  const potentialPidStartObjects = pidGraph.diagramSymbolInstances.filter(
    (instance) => ['Instrument', 'Equipment'].includes(instance.type)
  );
  const potentialIsoStartObjects = isoGraph.diagramSymbolInstances.filter(
    (instance) => ['Instrument', 'Equipment'].includes(instance.type)
  );

  const startObjects = getUniqueCrossConnections(
    potentialPidStartObjects,
    potentialIsoStartObjects
  );

  const relevantSymbolTypes = [
    'Instrument',
    'Equipment',
    'Cap',
    'Valve',
    'Flange',
    'Reducer',
  ];

  const shortestPathsPid: PathOutputFormat[] = [];
  startObjects.forEach((value) =>
    shortestPathsPid.push(
      ...calculateShortestPaths(
        [value.pidInstanceId],
        pidGraph,
        relevantSymbolTypes
      )
    )
  );

  const shortestPathsIso: PathOutputFormat[] = [];
  startObjects.forEach((value) =>
    shortestPathsIso.push(
      ...calculateShortestPaths(
        [value.isoInstanceId],
        isoGraph,
        relevantSymbolTypes
      )
    )
  );

  const editDistances = getEditDistanceBetweenPaths(
    shortestPathsPid,
    shortestPathsIso
  );

  const symbolMapping = getOptimalEditDistanceMapping(
    editDistances,
    startObjects
  );
  return { editDistances, symbolMapping, startObjects };
};
