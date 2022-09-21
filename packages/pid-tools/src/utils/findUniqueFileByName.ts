import { CogniteClient, FileInfo } from '@cognite/sdk';

/** Find a single CDF file by name */
export default async function findUniqueFileByName(
  client: CogniteClient,
  fileName: string
): Promise<FileInfo | undefined> {
  const files = await client.files
    .list({
      filter: { name: fileName },
    })
    .autoPagingToArray({ limit: 2 });
  if (files.length !== 1) {
    return undefined;
  }
  return files[0];
}
