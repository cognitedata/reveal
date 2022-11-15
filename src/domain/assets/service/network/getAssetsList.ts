import {
  Asset,
  AssetFilterProps,
  CogniteClient,
  CursorResponse,
} from '@cognite/sdk';
import { AssetsProperties } from 'domain/assets';
import { AdvancedFilter } from 'domain/builders';
import { InternalSortBy } from 'domain/types';
import { normalizeAssets } from '../transformers/normalize';

export const getAssetsList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    cursor,
    limit,
    filter,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<AssetsProperties>;
    cursor?: string;
    limit?: number;
    filter?: AssetFilterProps;
    sort?: InternalSortBy[];
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
          sort,
          aggregatedProperties: ['path'],
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
