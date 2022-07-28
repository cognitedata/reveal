import fsPromises from 'fs/promises';

import { GraphDocument, isValidGraphDocumentJson } from '../src';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';
import { listNodes, upsertNodes, ViewboxNodeAdapter } from '../src/dms';

/** Load a valid GraphDocument from file, throwing Error if result would be invalid */
async function loadGraphDocument(path: string): Promise<GraphDocument> {
  const graphDocument = JSON.parse(
    await fsPromises.readFile(path, { encoding: 'utf-8' })
  );
  if (!isValidGraphDocumentJson(graphDocument)) {
    throw Error(`File loaded from ${path} is not a valid GraphDocument`);
  }
  return graphDocument;
}

export const upsertDms = async (argv: any) => {
  const { path, fileId, filePage, spaceExternalId } = argv as {
    path: string;
    fileId: number;
    filePage: number;
    spaceExternalId: string;
  };

  const client = await getMsalClient(argv as MsalClientOptions);
  const graphDocument = await loadGraphDocument(path);

  const viewboxNode = ViewboxNodeAdapter.fromRect(graphDocument.viewBox, {
    externalId: `viewbox_${fileId}_${filePage}`,
    fileId,
    filePage,
  });

  const upsertedNodes = await upsertNodes(client, {
    NodeAdapterType: ViewboxNodeAdapter,
    items: [viewboxNode],
    spaceExternalId,
  });

  console.log('Upserted nodes:\n', upsertedNodes);

  const retrievedNodes = await listNodes(client, {
    NodeAdapterType: ViewboxNodeAdapter,
    spaceExternalId,
    filters: [
      {
        property: 'filePage',
        values: [upsertedNodes[0].filePage],
      },
      {
        property: 'fileId',
        values: [upsertedNodes[0].fileId],
      },
    ],
    limit: Infinity,
  });
  console.log('Retrieved nodes:\n', retrievedNodes);
};

export default upsertDms;
