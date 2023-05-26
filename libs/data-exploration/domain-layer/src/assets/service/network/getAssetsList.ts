import {
  Asset,
  AssetFilterProps,
  CogniteClient,
  CursorResponse,
} from '@cognite/sdk';

import { AdvancedFilter } from '../../../builders';
import { InternalSortBy } from '../../../types';
import { AssetsProperties } from '../../internal';
import { normalizeAssets } from '../transformers';

export const getAssetsList = (
  sdk: CogniteClient,
  {
    advancedFilter,
    cursor,
    limit,
    filter,
    sort,
    aggregatedProperties,
  }: {
    advancedFilter?: AdvancedFilter<AssetsProperties>;
    cursor?: string;
    limit?: number;
    filter?: AssetFilterProps;
    sort?: InternalSortBy[];
    aggregatedProperties?: string[];
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
          aggregatedProperties: aggregatedProperties || ['path'],
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
