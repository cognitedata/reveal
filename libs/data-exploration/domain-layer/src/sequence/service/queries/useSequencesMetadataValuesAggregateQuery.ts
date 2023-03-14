import { useSDK } from '@cognite/sdk-provider';
import { InternalSequenceFilters, OldSequenceFilters } from '../../internal';
import { SequencesMetadataAggregateResponse } from '../types';
import { useQuery, UseQueryOptions } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getSequencesMetadataValuesAggregate } from '../network/getSequencesMetadataValuesAggregate';
import { transformNewFilterToOldFilter } from '../../../transformers';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

export const useSequencesMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
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
    queryKeys.sequencesMetadataValues(String(metadataKey), filter),
    () =>
      getSequencesMetadataValuesAggregate(sdk, String(metadataKey), {
        filter: transformNewFilterToOldFilter(filter),
      }),
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
