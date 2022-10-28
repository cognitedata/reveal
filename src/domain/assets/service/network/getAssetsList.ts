import { Asset, CogniteClient, CursorResponse } from '@cognite/sdk';
import { normalizeAssets } from '../transformers/normalize';

export const getAssetsList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    cursor,
    limit,
    filter,
  }: {
    advancedFilter?: any;
    cursor?: string;
    limit?: number;
    filter?: Record<string, any>;
  }
) => {
  return sdk
    .post<CursorResponse<Asset[]>>(
      `/api/v1/projects/${sdk.project}/assets/list`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          limit: limit ?? 1000,
          cursor,
          advancedFilter,
          filter,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: normalizeAssets(data.items),
        nextCursor: data.nextCursor,
      };
    });
};
