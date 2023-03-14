import { CogniteClient } from '@cognite/sdk';
import {
  TimeseriesAggregateFilters,
  TimeseriesAggregateUniqueValuesResponse,
  TimeseriesProperty,
} from '@data-exploration-lib/domain-layer';

import { getTimeseriesAggregate } from './getTimeseriesAggregate';

export const getTimeseriesUniqueValuesByProperty = (
  sdk: CogniteClient,
  property: TimeseriesProperty,
  filters: TimeseriesAggregateFilters = {}
): Promise<TimeseriesAggregateUniqueValuesResponse[]> => {
  return getTimeseriesAggregate<TimeseriesAggregateUniqueValuesResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueValues',
    properties: [
      {
        property: [property],
      },
    ],
  }).then(({ items }) => items);
};
