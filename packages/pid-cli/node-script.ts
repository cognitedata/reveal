/* eslint-disable no-console */
import * as fs from 'fs';
import path from 'path';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import {
  computeLineFiles,
  GraphDocument,
  resolveFileAndLineConnections,
} from '../pid-tools/src';
import { SymbolConnection } from '../pid-tools/src/graphMatching/types';

import emptyDir from './utils/emptyDir';
import readJsonFromFile from './utils/readJsonFromFile';
import writeJsonToFile from './utils/writeJsonToFile';
import { graphMatching } from './graphMatching';

const run = async () => {
  const { argv } = yargs(hideBin(process.argv))
    .option('prefer-connections-from-file', {
      type: 'boolean',
      describe: 'if connections should be read from file',
      default: false,
    })
    .option('output-version', {
      type: 'string',
      describe: 'the version infix to add to output file names',
      demandOption: true,
    });
  const { preferConnectionsFromFile, outputVersion } = argv as unknown as {
    preferConnectionsFromFile: boolean;
    outputVersion: string;
  };

  const GRAPH_DIR = path.resolve('graphs');
  const OUTPUT_DIRECTORY = path.resolve('documents');
  const connectionsPath = path.resolve('connections/connections.json');

  await emptyDir(OUTPUT_DIRECTORY);

  fs.readdir(GRAPH_DIR, (error, fileNames) => {
    if (error) {
      throw error;
    }

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
        [...graph.lines, ...graph.symbolInstances].map(
          (instance) => instance.id
        )
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

    const doesConnectionsFileExists = fs.existsSync(connectionsPath);
    const connections =
      doesConnectionsFileExists && preferConnectionsFromFile
        ? readJsonFromFile<{ connections: SymbolConnection[] }>(
            '',
            connectionsPath
          ).connections
        : graphMatching(
            graphs,
            fileAndLineConnectionLinks,
            'symbolMapping.json'
          );

    computeLineFiles(
      graphs,
      [...connections, ...fileAndLineConnectionLinks],
      outputVersion
    ).forEach(({ fileName, data }) => {
      console.log(`Writing output file ${fileName}`);
      writeJsonToFile(OUTPUT_DIRECTORY, fileName, data);
    });
  });
};

run();
