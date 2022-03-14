/* eslint-disable no-console */
import * as fs from 'fs';
import path from 'path';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import { computeLineFiles, GraphDocument } from '../pid-tools/src';
import { SymbolConnection } from '../pid-tools/src/graphMatching/types';

import emptyDir from './utils/emptyDir';
import readJsonFromFile from './utils/readJsonFromFile';
import writeJsonToFile from './utils/writeJsonToFile';

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

    const doesConnectionsFileExists = fs.existsSync(connectionsPath);
    const connections =
      doesConnectionsFileExists && preferConnectionsFromFile
        ? readJsonFromFile<{ connections: SymbolConnection[] }>(
            '',
            connectionsPath
          ).connections
        : []; // insert matchGraphs(graphs) here

    const graphs = fileNames
      .filter((fileName) => path.extname(fileName).toLowerCase() === '.json')
      .map((fileName) => {
        console.log(`Processing file ${fileName}`);
        return readJsonFromFile<GraphDocument>(GRAPH_DIR, fileName);
      });

    computeLineFiles(graphs, connections, outputVersion).forEach(
      ({ fileName, data }) => {
        console.log(`Writing output file ${fileName}`);
        writeJsonToFile(OUTPUT_DIRECTORY, fileName, data);
      }
    );
  });
};

run();
