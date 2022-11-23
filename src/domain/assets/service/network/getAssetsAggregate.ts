import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  AssetFilterProps,
} from '@cognite/sdk';
import { AssetsProperties } from 'domain/assets';
import { AdvancedFilter } from 'domain/builders';
import {
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
  MORE_THAN_MAX_RESULT_LIMIT,
} from 'domain/constants';
import { isEmpty } from 'lodash';

export const getAssetsAggregate = (
  sdk: CogniteClient,
  {
    filter,
    advancedFilter,
  }: {
    filter?: AssetFilterProps;
    advancedFilter?: AdvancedFilter<AssetsProperties>;
  }
) => {
  // If there are query or filters, use advanced filter result counts with max limit(1000)
  if (!isEmpty(filter) || !isEmpty(advancedFilter)) {
    return sdk
      .post<CursorResponse<AggregateResponse[]>>(
        `/api/v1/projects/${sdk.project}/assets/list`,
        {
          headers: {
            'cdf-version': 'alpha',
          },
          data: {
            limit: DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
            filter,
            advancedFilter,
            aggregatedProperties: ['path'],
          },
        }
      )
      .then(({ data }) => {
        const { items, nextCursor } = data;
        const listCount = nextCursor
          ? MORE_THAN_MAX_RESULT_LIMIT
          : items.length;

        return {
          items: [{ count: listCount }],
        };
      });
  }

  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/assets/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          // filter,
          // advancedFilter,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
      };
    });
};
