/* eslint-disable no-console */
import * as fs from 'fs';
import path from 'path';

import {
  ParsedDocument,
  ParsedDocumentsForLine,
  computeLines,
  GraphDocument,
} from '../pid-tools/src';

import { version } from './package.json';

const args = process.argv;

const preferConnectionsFromFile = args.includes(
  '--prefer-connections-from-file'
);

const graphDir = path.resolve('graphs');
const outDir = path.resolve('documents');

const connectionsPath = path.resolve('connections/connections.json');

const store = (document: ParsedDocument | ParsedDocumentsForLine) => {
  fs.writeFile(
    path.resolve(outDir, document.externalId),
    JSON.stringify(document, undefined, 2),
    (error) => {
      console.log(error);
    }
  );
};

const connectionsFileExists = fs.existsSync(connectionsPath);
const connectionsFile = connectionsFileExists
  ? fs.readFileSync(connectionsPath)
  : undefined;

fs.readdir(graphDir, (error, files) => {
  if (error) {
    console.log(error);
  }
  const graphs = files?.reduce<GraphDocument[]>((result, file) => {
    if (path.extname(file).toLowerCase() === '.json') {
      const graphPath = path.resolve(graphDir, file);
      console.log(`Processing file ${graphPath}`);
      const data = fs.readFileSync(graphPath);
      const graph = JSON.parse(data.toString()) as GraphDocument;
      result.push(graph);
    }
    return result;
  }, []);

  const connections =
    connectionsFile && preferConnectionsFromFile
      ? JSON.parse(connectionsFile.toString()).connections
      : []; // insert matchGraphs(graphs) here

  if (graphs?.length) {
    computeLines(graphs, connections, version, store);
  }
});
