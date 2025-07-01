import type { CogniteClient, CursorResponse, Asset } from '@cognite/sdk';
import type { AllAssetFilterProps } from '../../query/network/filters';

export type AssetsListOptions = {
  cursor?: string;
  limit?: number;
  sort?: Array<{ property: string[] }>;
  filters?: AllAssetFilterProps;
  aggregatedProperties?: string[];
};

const sortOption = [{ property: ['_score_'] }];

export const getAssetsList = async (
  sdk: CogniteClient,
  {
    cursor,
    limit = 1000,
    sort = sortOption,
    filters,
    aggregatedProperties = ['path']
  }: AssetsListOptions
): Promise<{ items: Asset[]; nextCursor: string | undefined }> => {
  // The `aggregatedProperties` parameter is not yet public, and hidden behind an alpha flag,
  // which is why we cannot use the sdk.assets.list method directly
  return await sdk
    .post<CursorResponse<Asset[]>>(`/api/v1/projects/${sdk.project}/assets/list`, {
      headers: {
        'cdf-version': 'alpha'
      },
      data: {
        limit,
        sort,
        ...filters,
        aggregatedProperties,
        cursor
      }
    })
    .then(({ data }) => {
      return {
        items: data.items,
        nextCursor: data.nextCursor
      };
    });
};
