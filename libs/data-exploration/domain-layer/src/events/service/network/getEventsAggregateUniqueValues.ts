import {
  CogniteClient,
  CursorResponse,
  UniqueValuesAggregateResponse,
} from '@cognite/sdk';

import {
  AdvancedFilter,
  EventAggreateOptions,
} from '@data-exploration-lib/domain-layer';

import {
  EventsProperties,
  InternalEventsFilters,
} from '@data-exploration-lib/domain-layer';

export const getEventsAggregateUniqueValues = (
  sdk: CogniteClient,
  {
    filter,
    advancedFilter,
    aggregateOptions,
  }: {
    filter?: InternalEventsFilters;
    advancedFilter?: AdvancedFilter<EventsProperties>;
    aggregateOptions: EventAggreateOptions;
  }
) => {
  return sdk
    .post<CursorResponse<UniqueValuesAggregateResponse[]>>(
      `/api/v1/projects/${sdk.project}/events/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter,
          advancedFilter,
          aggregate: 'uniqueValues',
          properties: [{ property: aggregateOptions.fields }],
        },
      }
    )
    .then(({ data }) => {
      return data.items;
    });
};
