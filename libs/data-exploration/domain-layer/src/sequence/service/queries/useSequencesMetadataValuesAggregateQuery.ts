import { useSDK } from '@cognite/sdk-provider';
import { SequencesMetadataAggregateResponse } from '../types';
import { useQuery, UseQueryOptions } from 'react-query';
import { queryKeys } from '../../../queryKeys';
import { getSequencesMetadataValuesAggregate } from '../network/getSequencesMetadataValuesAggregate';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { AdvancedFilter } from '../../../builders';
import { SequenceProperties } from '../../internal';

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<SequenceProperties>;
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
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.sequencesMetadataValues(
      String(metadataKey),
      query,
      advancedFilter
    ),
    () =>
      getSequencesMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
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
