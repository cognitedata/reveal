import { CogniteClient } from '@cognite/sdk';
import { Scan } from 'types';

export const callScarletScanner = async (
  client: CogniteClient,
  { documentId }: { documentId: number }
): Promise<Scan> => {
  const resp = await client.post(
    `/api/playground/projects/${client.project}/context/forms/scan`,
    {
      data: {
        items: [{ fileId: documentId }],
      },
    }
  );
  return resp.data;
};
