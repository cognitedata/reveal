import { CogniteClient, FileInfo } from '@cognite/sdk';

/** Find a single CDF file by name. Raise an error if no unique file can be found */
export default async function findUniqueFileByName(
  client: CogniteClient,
  fileName: string
): Promise<FileInfo> {
  const files = await client.files
    .list({
      filter: { name: fileName },
    })
    .autoPagingToArray({ limit: 2 });
  if (files.length !== 1) {
    throw Error(`No unique file with name ${fileName} found`);
  }
  return files[0];
}
