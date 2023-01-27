import { CogniteClient } from '@cognite/sdk';
import {
  TimeseriesAggregateFilters,
  TimeseriesAggregateUniquePropertiesResponse,
  TimeseriesMetadataAggregateResponse,
  TimeseriesMetadataProperty,
} from '@data-exploration-lib/domain-layer';

import { getTimeseriesAggregate } from './getTimeseriesAggregate';

export const getTimeseriesMetadataKeysAggregate = (
  sdk: CogniteClient,
  filters: TimeseriesAggregateFilters = {}
): Promise<TimeseriesMetadataAggregateResponse[]> => {
  return getTimeseriesAggregate<TimeseriesAggregateUniquePropertiesResponse>(
    sdk,
    {
      ...filters,
      aggregate: 'uniqueProperties',
      path: ['metadata'],
    }
  ).then(({ items }) => {
    return items.map(({ count, values: [value] }) => {
      const metadataKey = (value.property as TimeseriesMetadataProperty)[1];
      return {
        count,
        value: metadataKey,
        values: [metadataKey],
      };
    });
  });
};
