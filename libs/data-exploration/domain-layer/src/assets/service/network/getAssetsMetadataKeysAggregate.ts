import { CogniteClient } from '@cognite/sdk';
import {
  AssetMetadataProperty,
  AssetsAggregateFilters,
  AssetsAggregateUniquePropertiesResponse,
  AssetsMetadataAggregateResponse,
} from '../types';

import { getAssetsAggregate } from './getAssetsAggregate';

export const getAssetsMetadataKeysAggregate = (
  sdk: CogniteClient,
  filters: AssetsAggregateFilters = {}
): Promise<AssetsMetadataAggregateResponse[]> => {
  return getAssetsAggregate<AssetsAggregateUniquePropertiesResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueProperties',
    path: ['metadata'],
  }).then(({ items }) => {
    return items.map(({ count, value }) => {
      const metadataKey = (value.property as AssetMetadataProperty)[1];
      return {
        count,
        value: metadataKey,
        values: [metadataKey],
      };
    });
  });
};
