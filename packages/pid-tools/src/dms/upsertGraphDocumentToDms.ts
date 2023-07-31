/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { CogniteClient } from '@cognite/sdk';

import { findUniqueFileByName, GraphDocument } from '..';

import {
  deleteEdges,
  deleteNodes,
  graphDocumentToNodesAndEdges,
  listEdges,
  listNodes,
  ModelEdgeMap,
  ModelNodeMap,
  upsertEdges,
  upsertNodes,
} from '.';

export const upsertGraphDocumentToDms = async (
  client: CogniteClient,
  graphDocument: GraphDocument,
  {
    filePage,
    spaceExternalId,
  }: {
    filePage: number;
    spaceExternalId: string;
  }
) => {
  // Find fileId of the file referenced in the GraphDocument in the project
  const fileId = (
    await findUniqueFileByName(client, graphDocument.documentMetadata.name)
  )?.id;
  if (fileId === undefined) {
    console.warn(
      'Skipping upsert of GraphDocument to DMS since no unique CDF file could be found'
    );
    return;
  }

  // Convert the graph document into nodes and edges
  const { nodes, edges } = graphDocumentToNodesAndEdges({
    graphDocument,
    spaceExternalId,
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
  let startTime = new Date().getTime();
  for (const model of Object.keys(edges)) {
    // eslint-disable-next-line no-continue
    if (model === 'FileLink') continue; // Fix: We should maybe delete orphan file link edges as well

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
        `    Deleting ${oldItems.length} old '${model}' edges on page ${filePage} of file ${fileId}`
      );
      await deleteEdges(client, {
        items: oldItems,
        spaceExternalId,
      });
    }
  }
  let elapsedMilliseconds = new Date().getTime() - startTime;
  console.log(`    Elapsed time: ${elapsedMilliseconds / 1000}s`);

  console.log('Deleting old nodes ...');
  startTime = new Date().getTime();
  await Promise.all(
    Object.keys(nodes).map(async (model) => {
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
          `    Deleting ${oldItems.length} old '${model}' nodes on page ${filePage} of file ${fileId}`
        );
        await deleteNodes(client, { items: oldItems, spaceExternalId });
      }
    })
  );
  elapsedMilliseconds = new Date().getTime() - startTime;
  console.log(`    Elapsed time: ${elapsedMilliseconds / 1000}s`);

  console.log('Upserting new nodes ...');
  startTime = new Date().getTime();
  await Promise.all(
    Object.entries(nodes).map(async ([model, items]) => {
      if (items.length > 0) {
        console.log(
          `    Upserting ${items.length} new '${model}' nodes for page ${filePage} of file ${fileId}`
        );
        await upsertNodes(client, {
          model: model as keyof ModelNodeMap,
          items,
          spaceExternalId,
        });
      }
    })
  );
  elapsedMilliseconds = new Date().getTime() - startTime;
  console.log(`    Elapsed time: ${elapsedMilliseconds / 1000}s`);

  console.log('Upserting new edges ...');
  startTime = new Date().getTime();
  await Promise.all(
    Object.entries(edges).map(async ([model, items]) => {
      if (items.length > 0) {
        console.log(
          `    Upserting ${items.length} new '${model}' edges for page ${filePage} of file ${fileId}`
        );
        await upsertEdges(client, {
          model: model as keyof ModelEdgeMap,
          items,
          spaceExternalId,
        });
      }
    })
  );
  elapsedMilliseconds = new Date().getTime() - startTime;
  console.log(`    Elapsed time: ${elapsedMilliseconds / 1000}s`);
};
