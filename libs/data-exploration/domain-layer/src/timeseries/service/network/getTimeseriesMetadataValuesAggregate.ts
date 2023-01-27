import { CogniteClient } from '@cognite/sdk';
import {
  TimeseriesAggregateFilters,
  TimeseriesAggregateUniqueValuesResponse,
  TimeseriesMetadataAggregateResponse,
} from '@data-exploration-lib/domain-layer';

import { getTimeseriesAggregate } from './getTimeseriesAggregate';

export const getTimeseriesMetadataValuesAggregate = (
  sdk: CogniteClient,
  metadataKey: string,
  filters: TimeseriesAggregateFilters = {}
): Promise<TimeseriesMetadataAggregateResponse[]> => {
  return getTimeseriesAggregate<TimeseriesAggregateUniqueValuesResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueValues',
    properties: [
      {
        property: ['metadata', metadataKey],
      },
    ],
  }).then(({ items }) => {
    return items.map((item) => {
      return {
        ...item,
        value: item.values[0],
      };
    });
  });
};
