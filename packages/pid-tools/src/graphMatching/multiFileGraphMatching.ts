/* eslint-disable no-param-reassign */

import { Graph } from '../graph';
import { DiagramConnection } from '../types';
import { DiagramInstanceId, GraphDocument } from '..';
import { GraphOutputFormat } from '../graph/types';

import { SymbolConnection } from './types';

export const GLOBALSPLITPREFIX = '_GLOBAL_';

export const mergeGraphs = (graphs: GraphDocument[]): GraphOutputFormat => {
  const combinedGraph = {
    diagramConnections: [],
    diagramLineInstances: [],
    diagramSymbolInstances: [],
  } as GraphOutputFormat;

  graphs.forEach((thisGraph) => {
    combinedGraph.diagramConnections = [
      ...combinedGraph.diagramConnections,
      ...thisGraph.connections,
    ];

    combinedGraph.diagramLineInstances = [
      ...combinedGraph.diagramLineInstances,
      ...thisGraph.lines,
    ];

    combinedGraph.diagramSymbolInstances = [
      ...combinedGraph.diagramSymbolInstances,
      ...thisGraph.symbolInstances,
    ];
  });
  return combinedGraph;
};

export const getGlobalizedId = (
  fileName: string,
  instanceId: DiagramInstanceId
) => {
  return `${fileName}${GLOBALSPLITPREFIX}${instanceId}`;
};

export const getUnglobalizedId = (globalId: DiagramInstanceId) => {
  return globalId.split(GLOBALSPLITPREFIX)[1];
};

export const convertGraphToGlobalizedIds = (graph: GraphDocument) => {
  // Verify that the IDs are correct
  const instanceIds = [...graph.symbolInstances, ...graph.lines].flatMap(
    (i) => i.id
  );
  graph.connections.forEach((connection) => {
    if (!instanceIds.includes(connection.start)) {
      // eslint-disable-next-line no-console
      console.warn(
        `GLOBAL GRAPH: Instance with id ${connection.start} does not exist in ${graph.documentMetadata.name}.\n    Connection: ${connection.start}, ${connection.end}`
      );
    }

    if (!instanceIds.includes(connection.end)) {
      // eslint-disable-next-line no-console
      console.warn(
        `GLOBAL GRAPH: Instance with id ${connection.end} does not exist in ${graph.documentMetadata.name}.\n    Connection: ${connection.start}, ${connection.end}`
      );
    }
  });

  const fileName = graph.documentMetadata.name;
  graph.symbolInstances.forEach((instance) => {
    instance.id = getGlobalizedId(fileName, instance.id);
  });

  graph.lines.forEach((instance) => {
    instance.id = getGlobalizedId(fileName, instance.id);
  });

  graph.connections.forEach((connectionInstance) => {
    connectionInstance.start = getGlobalizedId(
      fileName,
      connectionInstance.start
    );
    connectionInstance.end = getGlobalizedId(fileName, connectionInstance.end);
  });

  return graph;
};

export const convertGraphToUnglobalizedIds = (graph: GraphDocument) => {
  graph.symbolInstances.forEach((instance) => {
    instance.id = getUnglobalizedId(instance.id);
  });

  graph.lines.forEach((instance) => {
    instance.id = getUnglobalizedId(instance.id);
  });

  graph.connections.forEach((connectionInstance) => {
    connectionInstance.start = getUnglobalizedId(connectionInstance.start);
    connectionInstance.end = getUnglobalizedId(connectionInstance.end);
  });
  return graph;
};

export const appendSymbolConnections = (
  combinedGraph: Graph,
  documentLinks: SymbolConnection[]
) => {
  // currently this is handled by findIsoLink. So we get the results as DocumentLinks. Lets just convert that to DiagramConnections
  combinedGraph.diagramConnections = [
    ...combinedGraph.diagramConnections,
    ...documentLinks.map((link) => {
      return {
        direction: 'unknown',
        start: getGlobalizedId(link.from.fileName, link.from.instanceId),
        end: getGlobalizedId(link.to.fileName, link.to.instanceId),
      } as DiagramConnection;
    }),
  ];
};
