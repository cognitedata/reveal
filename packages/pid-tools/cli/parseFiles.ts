import fs from 'fs';
import path from 'path';
import util from 'util';

import {
  computeLineFiles,
  GraphDocument,
  resolveFileAndLineConnections,
} from '../src';

import { DOCUMENTS_DIR, GRAPHS_DIR } from './constants';
import { graphMatching } from './graphMatching';
import emptyDir from './utils/emptyDir';
import readJsonFromFile from './utils/readJsonFromFile';
import writeJsonToFile from './utils/writeJsonToFile';

const readDir = util.promisify(fs.readdir);

const parseFiles = async ({ outputVersion }: { outputVersion: string }) => {
  const GRAPH_DIR = path.resolve(GRAPHS_DIR);
  const OUTPUT_DIRECTORY = path.resolve(DOCUMENTS_DIR);

  await emptyDir(OUTPUT_DIRECTORY);
  const fileNames = await readDir(GRAPH_DIR);

  const graphs = fileNames
    .filter((fileName) => path.extname(fileName).toLowerCase() === '.json')
    .map((fileName) => {
      console.log(`Processing file ${fileName}`);
      return readJsonFromFile<GraphDocument>(GRAPH_DIR, fileName);
    });

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
  computeLineFiles(graphs, connections, outputVersion).forEach(
    ({ fileName, data }) => {
      console.log(`Writing output file ${fileName}`);
      writeJsonToFile(OUTPUT_DIRECTORY, fileName, data);
    }
  );
};

export default parseFiles;
