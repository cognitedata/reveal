import fs from 'fs';

import {
  GraphDocument,
  DocumentType,
  DiagramInstanceId,
} from '../pid-tools/src';
import { SymbolConnection } from '../pid-tools/src/graphMatching/types';
import {
  convertGraphToGlobalizedIds,
  convertGraphToUnglobalizedIds,
  GLOBALSPLITPREFIX,
  mergeGraphs,
  matchGraphs,
  appendSymbolConnections,
  getGlobalizedId,
} from '../pid-tools/src/graphMatching';
import {
  EditDistanceMapResult,
  SymbolMapping,
} from '../pid-tools/src/graphMatching/editDistance';

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

const saveSymbolMappingAsJsonFile = (
  path: string,
  symbolMapping: SymbolMapping
) => {
  const replacer = (key, value) => {
    // Filtering out properties
    if (['pidPath', 'isoPath'].includes(key)) {
      return undefined;
    }
    return value;
  };

  const symbolMappingObject = Object.fromEntries(symbolMapping);
  const content = JSON.stringify(symbolMappingObject, replacer, 2);
  fs.writeFileSync(path, content);
};

export const graphMatching = (
  graphs: GraphDocument[],
  connections: SymbolConnection[],
  symbolMappingFilePath: string | undefined = undefined
): SymbolConnection[] => {
  const globalGraphList: GraphDocument[] = [];
  graphs.forEach((graph: GraphDocument) => {
    const newGraph = convertGraphToGlobalizedIds(graph);
    globalGraphList.push(newGraph);
  });

  const pidGraphs = globalGraphList.filter(
    (g) => g.documentMetadata.type === DocumentType.pid
  );
  const isoGraphs = globalGraphList.filter(
    (g) => g.documentMetadata.type === DocumentType.isometric
  );

  const pidCombinedGraph = mergeGraphs(pidGraphs);
  const isoCombinedGraph = mergeGraphs(isoGraphs);

  const pidFileLinks = connections.filter((con) =>
    pidGraphs.some((g) => g.documentMetadata.name === con.from.fileName)
  );
  const isoFileLinks = connections.filter((con) =>
    isoGraphs.some((g) => g.documentMetadata.name === con.from.fileName)
  );

  // eslint-disable-next-line no-console
  console.log(
    `Linking: PID file links: ${pidFileLinks.length}, ISO file links: ${isoFileLinks.length}`
  );

  appendSymbolConnections(pidCombinedGraph, pidFileLinks);
  appendSymbolConnections(isoCombinedGraph, isoFileLinks);

  const { symbolMapping, startObjects } = matchGraphs(
    pidCombinedGraph,
    isoCombinedGraph
  );

  if (symbolMappingFilePath) {
    saveSymbolMappingAsJsonFile(symbolMappingFilePath, symbolMapping);
  }

  const matches: SymbolConnection[] =
    convertSymbolMappingToSymbolConnections(symbolMapping);

  {
    // Debug logging
    const startObjectsSet = new Set(
      startObjects.map(
        (startObject) =>
          `${startObject.pidInstanceId}|${startObject.isoInstanceId}`
      )
    );
    const numberOfStartObjectMatched = matches.filter((match) => {
      const mappingString = `${getGlobalizedId(
        match.from.fileName,
        match.from.instanceId
      )}|${getGlobalizedId(match.to.fileName, match.to.instanceId)}`;
      return startObjectsSet.has(mappingString);
    }).length;

    // eslint-disable-next-line no-console
    console.log(
      `SYMBOL MATCHING: Found ${symbolMapping.size} symbol mappings with ${startObjects.length} start objects (${numberOfStartObjectMatched} actually matched). ${pidCombinedGraph.diagramSymbolInstances.length} PID symbols and ${isoCombinedGraph.diagramSymbolInstances.length} ISO symbols.`
    );
  }

  graphs.forEach((graph: GraphDocument) => {
    convertGraphToUnglobalizedIds(graph);
  });

  return matches;
};
