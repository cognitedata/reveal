import {
  AggregateResponse,
  CogniteClient,
  CursorResponse,
  EventFilter,
} from '@cognite/sdk';
import { AdvancedFilter } from 'domain/builders';
import {
  DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
  MORE_THAN_MAX_RESULT_LIMIT,
} from 'domain/constants';
import { EventsProperties } from 'domain/events';
import { isEmpty } from 'lodash';

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
  // If there are query or filters, use advanced filter result counts with max limit(1000)
  if (!isEmpty(filter) || !isEmpty(advancedFilter)) {
    return sdk
      .post<CursorResponse<AggregateResponse[]>>(
        `/api/v1/projects/${sdk.project}/events/list`,
        {
          headers: {
            'cdf-version': 'alpha',
          },
          data: {
            limit: DEFAULT_GLOBAL_TABLE_MAX_RESULT_LIMIT,
            filter,
            advancedFilter,
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
      `/api/v1/projects/${sdk.project}/events/aggregate`,
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
