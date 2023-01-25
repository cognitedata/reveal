import { CogniteClient, CursorResponse } from '@cognite/sdk';
import { AssetsAggregateRequestPayload } from '@data-exploration-lib/domain-layer';

export const getAssetsAggregate = <ResponseItemType>(
  sdk: CogniteClient,
  payload?: AssetsAggregateRequestPayload
) => {
  return sdk
    .post<CursorResponse<ResponseItemType[]>>(
      `/api/v1/projects/${sdk.project}/assets/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: payload,
      }
    )
    .then(({ data }) => {
      return {
        items: data.items,
      };
    });
};
