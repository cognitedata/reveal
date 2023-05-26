import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient, CursorResponse } from '@cognite/sdk';

import { DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT } from '../../../constants';
import { BasicMapping } from '../types';

export const getBasicMappingsByAssetId = (
  sdk: CogniteClient,
  {
    assetId,
    limit,
    cursor,
  }: {
    assetId: number;
    limit?: number | undefined;
    cursor?: string | undefined;
  }
) => {
  return sdk
    .get<CursorResponse<BasicMapping[]>>(
      `/api/v1/projects/${getProject()}/3d/mappings/${assetId}/modelnodes`,
      {
        params: {
          limit: limit ?? DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
          cursor,
        },
      }
    )
    .then((response) => {
      return {
        data: response.data.items,
        nextCursor: response.data.nextCursor,
      };
    });
};
