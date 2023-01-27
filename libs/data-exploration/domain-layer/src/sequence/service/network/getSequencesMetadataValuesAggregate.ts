import { CogniteClient } from '@cognite/sdk';
import { EMPTY_OBJECT } from '@data-exploration-lib/core';

import {
  SequencesAggregateFilters,
  SequencesMetadataAggregateResponse,
  SequencesAggregateUniqueValuesResponse,
} from '../types';
import { getSequencesAggregate } from './getSequencesAggregate';

export const getSequencesMetadataValuesAggregate = (
  sdk: CogniteClient,
  metadataKey: string,
  filters: SequencesAggregateFilters = EMPTY_OBJECT
): Promise<SequencesMetadataAggregateResponse[]> => {
  return getSequencesAggregate<SequencesAggregateUniqueValuesResponse>(sdk, {
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
