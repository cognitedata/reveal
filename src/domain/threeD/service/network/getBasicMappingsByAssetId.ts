import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk';

import { BasicMapping } from 'domain/threeD';

export const getBasicMappingsByAssetId = (
  sdk: CogniteClient,
  { assetId }: { assetId: number }
) =>
  sdk
    .post<{
      items: { assetId: number; mappings: BasicMapping[] }[];
    }>(`/api/v1/projects/${getProject()}/3d/mappings`, {
      data: {
        items: [
          {
            id: assetId,
          },
        ],
      },
    })
    .then(response => {
      const { data } = response;
      if (data.items.length > 0) {
        return data.items[0].mappings;
      }
      return [];
    });
