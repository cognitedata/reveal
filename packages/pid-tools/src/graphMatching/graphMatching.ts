/* eslint-disable no-continue */
import { GraphOutputFormat } from '../graph/types';
import { DiagramInstanceId, DiagramInstanceOutputFormat } from '../types';
import {
  getUnitAndLineNumberString,
  isEquipment,
  isEquipmentTag,
  isInstrument,
} from '../utils';
import { calculateShortestPaths, PathOutputFormat } from '../graph';
import areSetsEqual from '../utils/areSetsEqual';

import getCrossConnections from './utils/getCrossConnections';
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
): boolean => {
  if (isInstrument(pidInstance) && isInstrument(isoInstance)) {
    if (pidInstance.labels.length !== isoInstance.labels.length) return false;

    const pidLabelTexts = pidInstance.labels.flatMap((label) => label.text);
    const isoLabelTexts = isoInstance.labels.flatMap((label) => label.text);

    for (let i = 0; i < pidLabelTexts.length; i++) {
      if (!isoLabelTexts.includes(pidLabelTexts[i])) return false;
    }
    return true;
  }
  if (
    (isEquipment(pidInstance) || isEquipmentTag(pidInstance)) &&
    (isEquipment(isoInstance) || isEquipmentTag(isoInstance))
  ) {
    return (
      pidInstance.equipmentTag !== undefined &&
      pidInstance.equipmentTag === isoInstance.equipmentTag
    );
  }

  if (pidInstance.type === 'Line Break' && isoInstance.type === 'Line Break') {
    const pidLineNumbers = new Set<string>();
    pidInstance.labels.forEach((label) => {
      const lineNumber = getUnitAndLineNumberString(label.text);
      if (lineNumber) {
        pidLineNumbers.add(lineNumber);
      }
    });

    if (pidLineNumbers.size !== 2) return false;

    const isoLineNumbers = new Set<string>();
    isoInstance.labels.forEach((label) => {
      const lineNumber = getUnitAndLineNumberString(label.text);
      if (lineNumber) {
        isoLineNumbers.add(lineNumber);
      }
    });

    if (areSetsEqual(pidLineNumbers, isoLineNumbers)) return true;

    return false;
  }
  return false;
};

export const getAllCrossConnections = (
  pidInstances: DiagramInstanceOutputFormat[],
  isoInstances: DiagramInstanceOutputFormat[]
): CrossDocumentConnection[] => {
  const instrumentsCrossConnections = getCrossConnections(
    pidInstances.filter(isInstrument),
    isoInstances.filter(isInstrument),
    isCrossConnection
  );

  const isEquipmentLike = (instance: DiagramInstanceOutputFormat) =>
    isEquipment(instance) || isEquipmentTag(instance);

  const equipmentTagCrossConnections = getCrossConnections(
    pidInstances.filter(isEquipmentLike),
    isoInstances.filter(isEquipmentLike),
    isCrossConnection
  );

  // eslint-disable-next-line no-console
  console.log(
    `GRAPH MATCHING: Found ${instrumentsCrossConnections.length} instrument connections`
  );
  // eslint-disable-next-line no-console
  console.log(
    `GRAPH MATCHING: Found ${equipmentTagCrossConnections.length} equipment tag connections`
  );

  return [...instrumentsCrossConnections, ...equipmentTagCrossConnections];
};

export const matchGraphs = (
  pidGraph: GraphOutputFormat,
  isoGraph: GraphOutputFormat
) => {
  const potentialPidStartObjects = [
    ...pidGraph.diagramSymbolInstances.filter((instance) =>
      ['Instrument', 'Equipment', 'Line Break'].includes(instance.type)
    ),
    ...pidGraph.diagramTags,
  ];
  const potentialIsoStartObjects = [
    ...isoGraph.diagramSymbolInstances.filter((instance) =>
      ['Instrument', 'Equipment', 'Line Break'].includes(instance.type)
    ),
    ...isoGraph.diagramTags,
  ];

  const startObjects = getAllCrossConnections(
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

  const symbolMapping = getOptimalEditDistanceMapping(editDistances);
  return { editDistances, symbolMapping, startObjects };
};
