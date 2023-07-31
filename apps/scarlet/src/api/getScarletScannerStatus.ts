import { CogniteClient } from '@cognite/sdk';
import { Scan } from 'types';

export const getScarletScannerStatus = async (
  client: CogniteClient,
  { jobId }: { jobId: number }
): Promise<Scan> => {
  const resp = await client.get(
    `/api/playground/projects/${client.project}/context/forms/scan/${jobId}`
  );
  return resp.data;
};
