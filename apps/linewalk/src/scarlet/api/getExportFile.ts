import { CogniteClient } from '@cognite/sdk';

export const getExportFile = async (
  client: CogniteClient,
  { id }: { id: number }
) => {
  if (!id) throw Error('File id is not set');
  const response = await client.files
    .getDownloadUrls([{ id }])
    .then((list) => list?.[0]);
  return response;
};
