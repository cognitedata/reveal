import { type CogniteClient, type Revision3D } from '@cognite/sdk';

export async function getRevisions(modelId: number, userSdk: CogniteClient): Promise<Revision3D[]> {
  const response = await userSdk.revisions3D.list(modelId);

  return response.items;
}
