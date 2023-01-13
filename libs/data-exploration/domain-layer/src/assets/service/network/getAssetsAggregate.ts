import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  AssetFilterProps,
} from '@cognite/sdk';
import {
  AssetsProperties,
  AdvancedFilter,
} from '@data-exploration-lib/domain-layer';

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
  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/assets/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter,
          advancedFilter,
        },
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
      };
    });
};
