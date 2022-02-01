/* eslint-disable no-continue */
import { Graph } from '../graph/types';
import { DiagramInstanceId, DiagramSymbolInstance } from '../types';
import { getDiagramInstanceId } from '../utils';
import { calculateShortestPaths, Path } from '../graph';

import {
  getEditDistanceBetweenPaths,
  getOptimalEditDistanceMapping,
} from './editDistance';

interface CrossDocumentConnection {
  pidInstanceId: DiagramInstanceId;
  isoInstanceId: DiagramInstanceId;
}

const getCrossDocumentConnectionsFromAssetExternalId = (
  pidSymbolInstances: DiagramSymbolInstance[],
  isoSymbolInstances: DiagramSymbolInstance[]
): CrossDocumentConnection[] => {
  const crossDocumentConnections: CrossDocumentConnection[] = [];
  for (let i = 0; i < pidSymbolInstances.length; i++) {
    const pidInstance: DiagramSymbolInstance = pidSymbolInstances[i];
    if (pidInstance.assetExternalId === undefined) continue;

    const isoInstancesWithAssetExternalId = isoSymbolInstances.filter(
      (isoAsset) => isoAsset.assetExternalId === pidInstance.assetExternalId
    );
    if (isoInstancesWithAssetExternalId.length === 1) {
      crossDocumentConnections.push({
        pidInstanceId: getDiagramInstanceId(pidInstance),
        isoInstanceId: getDiagramInstanceId(isoInstancesWithAssetExternalId[0]),
      });
    }
  }
  return crossDocumentConnections;
};

export const matchGraphs = (pidGraph: Graph, isoGraph: Graph) => {
  const startObjects = getCrossDocumentConnectionsFromAssetExternalId(
    pidGraph.diagramSymbolInstances.filter(
      (instance) => instance.type === 'Instrument'
    ),
    isoGraph.diagramSymbolInstances.filter(
      (instance) => instance.type === 'Instrument'
    )
  );

  const relevantSymbolTypes = [
    'Instrument',
    'Cap',
    'Valve',
    'Flange',
    'Reducer',
  ];

  const shortestPathsPid: Path[] = [];
  startObjects.forEach((value) =>
    shortestPathsPid.push(
      ...calculateShortestPaths(
        [value.pidInstanceId],
        pidGraph,
        relevantSymbolTypes
      )
    )
  );

  const shortestPathsIso: Path[] = [];
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

  return { editDistances, symbolMapping };
};
