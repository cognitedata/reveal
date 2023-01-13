import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  SequenceFilter,
} from '@cognite/sdk';
import {
  AdvancedFilter,
  SequenceProperties,
} from '@data-exploration-lib/domain-layer';

export const getSequenceAggregate = (
  sdk: CogniteClient,
  {
    filter,
    advancedFilter,
  }: {
    filter?: Required<SequenceFilter>['filter'];
    advancedFilter?: AdvancedFilter<SequenceProperties>;
  }
) => {
  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/sequences/aggregate`,
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
