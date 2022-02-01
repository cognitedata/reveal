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

const graphDir = path.resolve('graphs');
const outDir = path.resolve('documents');

const store = (document: ParsedDocument | ParsedDocumentsForLine) => {
  fs.writeFile(
    path.resolve(outDir, document.externalId),
    JSON.stringify(document, undefined, 2),
    (error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  );
};

fs.readdir(graphDir, (error, files) => {
  if (error) {
    // eslint-disable-next-line no-console
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

  if (graphs?.length) {
    computeLines(graphs, version, store);
  }
});
