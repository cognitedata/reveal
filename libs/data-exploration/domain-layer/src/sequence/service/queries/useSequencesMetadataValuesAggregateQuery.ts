import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { useSDK } from '@cognite/sdk-provider';

import { InternalSequenceFilters } from '@data-exploration-lib/core';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { SequenceProperties } from '../../internal';
import { getSequencesMetadataValuesAggregate } from '../network/getSequencesMetadataValuesAggregate';
import { SequencesMetadataAggregateResponse } from '../types';

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
