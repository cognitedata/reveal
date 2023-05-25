import { useSDK } from '@cognite/sdk-provider';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { InternalSequenceFilters } from '@data-exploration-lib/core';
import { SequencesMetadataAggregateResponse } from '../types';
import { queryKeys } from '../../../queryKeys';
import { getSequencesMetadataValuesAggregate } from '../network/getSequencesMetadataValuesAggregate';
import { AdvancedFilter } from '../../../builders';
import { SequenceProperties } from '../../internal';
import { transformNewFilterToOldFilter } from '../../../transformers';

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<SequenceProperties>;
  filter?: InternalSequenceFilters;
  options?: UseQueryOptions<
    SequencesMetadataAggregateResponse[],
    unknown,
    SequencesMetadataAggregateResponse[],
    any
  >;
}

export const useSequencesMetadataValuesAggregateQuery = ({
  metadataKey,
  query,
  advancedFilter,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.sequencesMetadataValues(
      String(metadataKey),
      query,
      advancedFilter,
      filter
    ),
    () =>
      getSequencesMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
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
