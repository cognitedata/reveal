/* eslint-disable no-console */
import * as fs from 'fs';
import path from 'path';

import {
  computeLines,
  GraphDocument,
  DocumentForUpload,
} from '../pid-tools/src';

import { version } from './package.json';
import documentVersions from './PARSED_DOCUMENT_VERSIONS.json';

const args = process.argv;

const preferConnectionsFromFile = args.includes(
  '--prefer-connections-from-file'
);

const graphDir = path.resolve('graphs');
const outDir = path.resolve('documents');

const connectionsPath = path.resolve('connections/connections.json');

// clear dir that will be uploaded to CDF
fs.readdir(outDir, (err, files) => {
  if (err) throw err;

  files.forEach((file) => {
    fs.unlink(path.join(outDir, file), (err) => {
      if (err) throw err;
    });
  });
});

const store = (document: DocumentForUpload) => {
  fs.writeFile(
    path.resolve(outDir, document.externalId),
    JSON.stringify(document, undefined, 2),
    (error) => {
      if (error) {
        throw error;
      }
    }
  );
};

const connectionsFileExists = fs.existsSync(connectionsPath);
const connectionsFile = connectionsFileExists
  ? fs.readFileSync(connectionsPath)
  : undefined;

fs.readdir(graphDir, (error, files) => {
  if (error) {
    throw error;
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

  const updatedVersion = {
    ...documentVersions,
    versions: [...documentVersions.versions, version],
  };
  fs.writeFile(
    path.resolve(documentVersions.externalId),
    JSON.stringify(updatedVersion, undefined, 2),
    (error) => {
      if (error) throw error;
    }
  );
});
