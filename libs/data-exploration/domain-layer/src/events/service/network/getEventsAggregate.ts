import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  EventFilter,
} from '@cognite/sdk';
import {
  AdvancedFilter,
  EventsProperties,
} from '@data-exploration-lib/domain-layer';

export const getEventsAggregate = (
  sdk: CogniteClient,
  {
    filter,
    advancedFilter,
  }: {
    filter?: EventFilter;
    advancedFilter?: AdvancedFilter<EventsProperties>;
  }
) => {
  return sdk
    .post<CursorResponse<AggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/events/aggregate`,
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
