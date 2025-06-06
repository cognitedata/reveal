import { type CogniteClient, type CursorResponse, type Asset } from '@cognite/sdk';
import { buildFilter } from '../../utilities/buildFilter';

const sortOption = [{ property: ['_score_'] }];

export const getAssetsList = async (
  sdk: CogniteClient,
  {
    query,
    cursor,
    limit = 1000,
    sort = sortOption,
    aggregatedProperties = ['path']
  }: {
    query: string;
    cursor?: string;
    limit?: number;
    sort?: Array<{ property: string[] }>;
    aggregatedProperties?: string[];
  }
): Promise<{ items: Asset[]; nextCursor: string | undefined }> => {
  const advancedFilter = buildFilter(query);

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
        advancedFilter,
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
