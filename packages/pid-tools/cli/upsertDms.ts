/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import fsPromises from 'fs/promises';
import path from 'path';

import { GraphDocument, isValidGraphDocumentJson } from '../src';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';
import {
  listNodes,
  ModelNodeMap,
  graphDocumentToNodesAndEdges,
  upsertNodes,
  deleteNodes,
  upsertEdges,
  deleteEdges,
  listEdges,
  ModelEdgeMap,
} from '../src/dms';

import findUniqueFileByName from './utils/findUniqueFileByName';

/** Load a valid GraphDocument from file, throwing Error if result would be invalid */
export async function loadGraphDocument(
  filePath: string
): Promise<GraphDocument> {
  const graphDocument = JSON.parse(
    await fsPromises.readFile(path.resolve(filePath), { encoding: 'utf-8' })
  );
  if (!isValidGraphDocumentJson(graphDocument)) {
    throw Error(`File loaded from ${path} is not a valid GraphDocument`);
  }
  return graphDocument;
}

export const upsertDms = async (argv: any) => {
  const typedArgv = argv as MsalClientOptions & {
    path: string;
    filePage: number;
    spaceExternalId: string;
  };
  const clientOptions: MsalClientOptions = typedArgv;
  const { path, filePage, spaceExternalId } = typedArgv;

  const client = await getMsalClient(clientOptions);

  const graphDocument = await loadGraphDocument(path);
  // Find fileId of the file referenced in the GraphDocument in the project
  const fileId = (
    await findUniqueFileByName(client, graphDocument.documentMetadata.name)
  ).id;

  // Convert the graph document into nodes and edges
  const { nodes, edges } = graphDocumentToNodesAndEdges({
    graphDocument,
    fileId,
    filePage,
  });

  // We need to delete old edges as the very first step here. This is due to a
  // limitation in DMS cascading edge deletions. When deleting nodes, any edge
  // connected to the nodes get automatically cleaned up. Concurrent deletions
  // of nodes in seperate requests can cascade into the concurrent deletion of
  // the same edges. This is currently not properly handled and will result in
  // 409 errors. We circumvent it by proactively deleting the edges first
  console.log('Deleting old edges ...');
  for (const model of Object.keys(edges)) {
    const oldItems = await listEdges(client, {
      model: model as keyof ModelEdgeMap,
      spaceExternalId,
      filters: [
        {
          property: 'filePage',
          values: [filePage],
        },
        {
          property: 'fileId',
          values: [fileId],
        },
        {
          property: 'modelName',
          values: [model],
        },
      ],
      limit: Infinity,
    });
    if (oldItems.length > 0) {
      console.log(
        `Deleting ${oldItems.length} old '${model}' edges on page ${filePage} of file ${fileId}`
      );
      await deleteEdges(client, { items: oldItems });
    }
  }

  console.log('Deleting old nodes ...');
  for (const model of Object.keys(nodes)) {
    const oldItems = await listNodes(client, {
      model: model as keyof ModelNodeMap,
      spaceExternalId,
      filters: [
        {
          property: 'filePage',
          values: [filePage],
        },
        {
          property: 'fileId',
          values: [fileId],
        },
        {
          property: 'modelName',
          values: [model],
        },
      ],
      limit: Infinity,
    });
    if (oldItems.length > 0) {
      console.log(
        `Deleting ${oldItems.length} old '${model}' nodes on page ${filePage} of file ${fileId}`
      );
      await deleteNodes(client, { items: oldItems });
    }
  }

  console.log('Upserting new nodes ...');
  for (const [model, items] of Object.entries(nodes)) {
    if (items.length > 0) {
      console.log(
        `Upserting ${nodes[model].length} new '${model}' nodes for page ${filePage} of file ${fileId}`
      );
      nodes[model] = await upsertNodes(client, {
        model: model as keyof ModelNodeMap,
        items,
        spaceExternalId,
      });
    }
  }

  console.log('Upserting new edges ...');
  for (const [model, items] of Object.entries(edges)) {
    if (items.length > 0) {
      console.log(
        `Upserting ${edges[model].length} new '${model}' edges for page ${filePage} of file ${fileId}`
      );
      edges[model] = await upsertEdges(client, {
        model: model as keyof ModelEdgeMap,
        items,
        spaceExternalId,
      });
    }
  }
};

export default upsertDms;
