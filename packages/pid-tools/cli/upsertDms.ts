import fsPromises from 'fs/promises';
import path from 'path';

import { GraphDocument, isValidGraphDocumentJson } from '../src';
import { upsertGraphDocumentToDms } from '../src/dms';
import getMsalClient, { MsalClientOptions } from '../src/utils/msalClient';

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
  const { path, filePage, spaceExternalId } = typedArgv;

  const client = await getMsalClient(typedArgv);

  const graphDocument = await loadGraphDocument(path);

  upsertGraphDocumentToDms(client, graphDocument, {
    filePage,
    spaceExternalId,
  });
};

export default upsertDms;
