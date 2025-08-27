import { type CogniteClient, type Revision3D } from '@cognite/sdk';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';

export async function getRevisions(
  modelId: number,
  userSdk?: CogniteClient
): Promise<Revision3D[]> {
  const sdk = userSdk ?? useSDK();
  const response = await sdk.revisions3D.list(modelId);

  return response.items;
}
