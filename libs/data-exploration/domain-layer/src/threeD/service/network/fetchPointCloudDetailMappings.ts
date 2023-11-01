import { CogniteClient } from '@cognite/sdk';

import { DetailedMapping } from '../types';

export async function fetchPointCloudDetailMappings(
  sdk: CogniteClient,
  pointCloudModelIds: { id: number }[]
): Promise<DetailedMapping[]> {
  const detailMappingRequests = pointCloudModelIds.map(
    async ({ id }): Promise<DetailedMapping | undefined> => {
      const modelRequest = sdk.models3D.retrieve(id);
      const revisionRequest = sdk.revisions3D.list(id);
      const [modelResult, revisionsResult] = await Promise.allSettled([
        modelRequest,
        revisionRequest,
      ]);

      if (
        modelResult.status === 'rejected' ||
        revisionsResult.status === 'rejected'
      ) {
        return undefined;
      }

      const model = modelResult.value;
      const revisions = revisionsResult.value.items;

      if (revisions.length === 0) {
        return undefined;
      }

      const revision = revisions.sort(
        (a, b) => b.createdTime.getTime() - a.createdTime.getTime()
      )[0];

      return { model, revision };
    }
  );

  const detailMappings = await Promise.all(detailMappingRequests);

  return detailMappings.filter(
    (mapping): mapping is DetailedMapping => mapping !== undefined
  );
}
