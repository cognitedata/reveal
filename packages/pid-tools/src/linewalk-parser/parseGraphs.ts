import { GraphDocument } from '../types';

import { graphMatching } from './graphMatching';
import { resolveFileAndLineConnections } from './links';
import { computeLineFiles } from './parser';
import { ParsedDocument, File } from './types';

const parseGraphs = async (
  graphs: GraphDocument[]
): Promise<File<ParsedDocument>[]> => {
  // FIX: prune graph connections
  for (let i = 0; i < graphs.length; i++) {
    const graph = graphs[i];
    const instanceIds = new Set(
      [...graph.lines, ...graph.symbolInstances].map((instance) => instance.id)
    );
    const prunedConnections = graph.connections.filter(
      (connection) =>
        instanceIds.has(connection.start) && instanceIds.has(connection.end)
    );

    const numPrunedConnections =
      graph.connections.length - prunedConnections.length;
    if (numPrunedConnections > 0) {
      // eslint-disable-next-line no-console
      console.log(
        `CONNECTIONS: Pruned ${numPrunedConnections} connections for file ${graph.documentMetadata.name}`
      );
    }
    graph.connections = prunedConnections;
  }

  const fileAndLineConnectionLinks = resolveFileAndLineConnections(graphs);

  const symbolConnections = graphMatching(
    graphs,
    fileAndLineConnectionLinks,
    'symbolMapping.json'
  );

  const connections = [...fileAndLineConnectionLinks, ...symbolConnections];
  return computeLineFiles(graphs, connections);
};

export default parseGraphs;
