import { CogniteClient } from '@cognite/sdk';
import {
  AssetsAggregateFilters,
  AssetsAggregateUniqueValuesResponse,
  AssetsMetadataAggregateResponse,
} from '@data-exploration-lib/domain-layer';

import { getAssetsAggregate } from './getAssetsAggregate';

export const getAssetsMetadataValuesAggregate = (
  sdk: CogniteClient,
  metadataKey: string,
  filters: AssetsAggregateFilters = {}
): Promise<AssetsMetadataAggregateResponse[]> => {
  return getAssetsAggregate<AssetsAggregateUniqueValuesResponse>(sdk, {
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
