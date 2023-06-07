import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  EventFilter,
} from '@cognite/sdk';

import { AdvancedFilter } from '../../../builders';
import { EventsProperties } from '../../internal';

export const getEventsAggregateCount = (
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
          aggregate: 'count',
        },
      }
    )
    .then(({ data }) => {
      return { count: data.items[0].count };
    });
};
