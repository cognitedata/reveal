import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk';

import { BasicMapping } from 'domain/threeD';

export const getBasicMappingsByAssetId = (
  sdk: CogniteClient,
  { assetId }: { assetId: number }
) =>
  sdk
    .get<{
      items: BasicMapping[];
    }>(`/api/v1/projects/${getProject()}/3d/mappings/${assetId}/modelnodes`)
    .then(response => {
      return response.data.items;
    });
