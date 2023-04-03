import { useSDK } from '@cognite/sdk-provider';
import { SequencesMetadataAggregateResponse } from '../types';
import { useQuery, UseQueryOptions } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getSequencesMetadataValuesAggregate } from '../network/getSequencesMetadataValuesAggregate';
import { transformNewFilterToOldFilter } from '../../../transformers';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import {
  InternalSequenceFilters,
  OldSequenceFilters,
} from '@data-exploration-lib/core';

export const useSequencesMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
  query?: string,
  filter?: InternalSequenceFilters | OldSequenceFilters,
  options?: UseQueryOptions<
    SequencesMetadataAggregateResponse[],
    unknown,
    SequencesMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.sequencesMetadataValues(String(metadataKey), query, filter),
    () =>
      getSequencesMetadataValuesAggregate(sdk, String(metadataKey), {
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      }),
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
