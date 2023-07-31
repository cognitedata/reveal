import isEqual from 'lodash/isEqual';

import {
  CrossDocumentConnection,
  getGlobalizedId,
  GLOBALSPLITPREFIX,
  matchGraphs,
  mergeGraphs,
  mutateGraphByAppendingSymbolConnections,
  mutateGraphToGlobalizedIds,
  mutateGraphToUnglobalizedIds,
} from '../graphMatching';
import {
  EditDistanceMapResult,
  SymbolMapping,
} from '../graphMatching/editDistance';
import { SymbolConnection } from '../graphMatching/types';
import { DiagramInstanceId, GraphDocument, DiagramType } from '../types';

export const globalIdToFileNameAndId = (globalId: string) => {
  const globalIdSplit = globalId.split(GLOBALSPLITPREFIX);
  return {
    fileName: globalIdSplit[0],
    id: globalIdSplit[1],
  };
};

const convertSymbolMappingToSymbolConnections = (
  symbolMapping: Map<DiagramInstanceId, EditDistanceMapResult>
): SymbolConnection[] => {
  const matches: SymbolConnection[] = [];
  symbolMapping.forEach((value, pidGlobalInstanceId) => {
    const { fileName: pidFileName, id: pidInstanceId } =
      globalIdToFileNameAndId(pidGlobalInstanceId);

    const { fileName: isoFileName, id: isoInstanceId } =
      globalIdToFileNameAndId(value.isoInstanceId);

    matches.push({
      from: { fileName: pidFileName, instanceId: pidInstanceId },
      to: { fileName: isoFileName, instanceId: isoInstanceId },
    });
  });
  return matches;
};

const crossDocumentConnectionToSymbolConnection = (
  crossDocumentConnection: CrossDocumentConnection
): SymbolConnection => {
  const { fileName: pidFileName, id: pidInstanceId } = globalIdToFileNameAndId(
    crossDocumentConnection.pidInstanceId
  );

  const { fileName: isoFileName, id: isoInstanceId } = globalIdToFileNameAndId(
    crossDocumentConnection.isoInstanceId
  );

  return {
    from: { fileName: pidFileName, instanceId: pidInstanceId },
    to: { fileName: isoFileName, instanceId: isoInstanceId },
  };
};

const logDebugSymbolMappingJson = (symbolMapping: SymbolMapping) => {
  const replacer = (key: any, value: any) => {
    // Filtering out properties
    if (['pidPath', 'isoPath'].includes(key)) {
      return undefined;
    }
    return value;
  };

  const symbolMappingObject = Object.fromEntries(symbolMapping);
  const content = JSON.stringify(symbolMappingObject, replacer, 2);
  return content;
};

export const graphMatching = (
  graphs: GraphDocument[],
  fileConnections: SymbolConnection[],
  symbolMappingFilePath: string | undefined = undefined
): SymbolConnection[] => {
  const symbolConnections: SymbolConnection[] = [];

  const globalGraphList: GraphDocument[] = [];
  graphs.forEach((graph: GraphDocument) => {
    // eslint-disable-next-line no-console
    console.log('mutateGraphToGlobalizedIds', graph.documentMetadata.name);
    const newGraph = mutateGraphToGlobalizedIds(graph);
    globalGraphList.push(newGraph);
  });

  const combinedSymbolMapping: SymbolMapping = new Map();
  const combinedStartObjects = [];

  const pidGraphs = globalGraphList.filter(
    (g) => g.documentMetadata.type === DiagramType.PID
  );
  const isoGraphs = globalGraphList.filter(
    (g) => g.documentMetadata.type === DiagramType.ISO
  );

  const pidCombinedGraph = mergeGraphs(pidGraphs);
  const isoCombinedGraph = mergeGraphs(isoGraphs);

  // eslint-disable-next-line no-console
  console.log(
    `\nGRAPH MATCHING: ${pidGraphs.length} PIDs (${pidCombinedGraph.diagramSymbolInstances.length} symbols, ${pidCombinedGraph.diagramTags.length} tags) and ${isoGraphs.length} ISOs (${isoCombinedGraph.diagramSymbolInstances.length} symbols, ${isoCombinedGraph.diagramTags.length} tags)`
  );

  const pidFileLinks = fileConnections.filter((con) =>
    pidGraphs.some((g) => g.documentMetadata.name === con.from.fileName)
  );
  const isoFileLinks = fileConnections.filter((con) =>
    isoGraphs.some((g) => g.documentMetadata.name === con.from.fileName)
  );

  // eslint-disable-next-line no-console
  console.log(
    `GRAPH MATCHING: PID file links: ${pidFileLinks.length}, ISO file links: ${isoFileLinks.length}`
  );

  mutateGraphByAppendingSymbolConnections(pidCombinedGraph, pidFileLinks);
  mutateGraphByAppendingSymbolConnections(isoCombinedGraph, isoFileLinks);

  const { symbolMapping, startObjects } = matchGraphs(
    pidCombinedGraph,
    isoCombinedGraph
  );

  const newSymbolConnectionsForLineNumber: SymbolConnection[] = [];

  symbolMapping.forEach((value, key) => {
    combinedSymbolMapping.set(key, value);
  });
  combinedStartObjects.push(...startObjects);

  const startObjectsSymbolConnections = startObjects.map(
    crossDocumentConnectionToSymbolConnection
  );

  newSymbolConnectionsForLineNumber.push(...startObjectsSymbolConnections);

  const symbolMappingConnections = convertSymbolMappingToSymbolConnections(
    symbolMapping
  ).filter((symbolConnection) => {
    return !newSymbolConnectionsForLineNumber.some((sc) =>
      isEqual(sc.from, symbolConnection.from)
    );
  });

  newSymbolConnectionsForLineNumber.push(...symbolMappingConnections);

  // eslint-disable-next-line no-console
  console.log(
    `GRAPH MATCHING: ${startObjectsSymbolConnections.length} start objects and ${symbolMappingConnections.length} symbol connections`
  );

  symbolConnections.push(...newSymbolConnectionsForLineNumber);

  {
    if (symbolMappingFilePath) {
      logDebugSymbolMappingJson(combinedSymbolMapping);
    }
    // Debug logging
    const startObjectsSet = new Set(
      combinedStartObjects.map(
        (startObject) =>
          `${startObject.pidInstanceId}|${startObject.isoInstanceId}`
      )
    );
    const numberOfStartObjectMatched = symbolConnections.filter((match) => {
      const mappingString = `${getGlobalizedId(
        match.from.fileName,
        match.from.instanceId
      )}|${getGlobalizedId(match.to.fileName, match.to.instanceId)}`;
      return startObjectsSet.has(mappingString);
    }).length;

    // eslint-disable-next-line no-console
    console.log(
      `SYMBOL MATCHING: Found ${combinedSymbolMapping.size} symbol mappings with ${combinedStartObjects.length} start objects (${numberOfStartObjectMatched} actually matched).`
    );
  }

  graphs.forEach((graph: GraphDocument) => {
    mutateGraphToUnglobalizedIds(graph);
  });

  return symbolConnections;
};
