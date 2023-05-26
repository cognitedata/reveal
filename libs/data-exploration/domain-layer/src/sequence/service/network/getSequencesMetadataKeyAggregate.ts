import { EMPTY_OBJECT } from '@data-exploration-lib/core';

import { CogniteClient } from '@cognite/sdk';

import {
  SequencesAggregateFilters,
  SequencesMetadataAggregateResponse,
  SequencesAggregateUniquePropertiesResponse,
  SequenceMetadataProperty,
} from '../types';

import { getSequencesAggregate } from './getSequencesAggregate';

export const getSequencesMetadataKeysAggregate = (
  sdk: CogniteClient,
  filters: SequencesAggregateFilters = EMPTY_OBJECT
): Promise<SequencesMetadataAggregateResponse[]> => {
  return getSequencesAggregate<SequencesAggregateUniquePropertiesResponse>(
    sdk,
    {
      ...filters,
      aggregate: 'uniqueProperties',
      path: ['metadata'],
    }
  ).then(({ items }) => {
    return items.map(({ count, values }) => {
      const metadataKey = (values[0].property as SequenceMetadataProperty)[1];
      return {
        count,
        value: metadataKey,
        values: [metadataKey],
      };
    });
  });
};
