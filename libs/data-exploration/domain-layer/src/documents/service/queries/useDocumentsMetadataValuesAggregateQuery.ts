import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { useSDK } from '@cognite/sdk-provider';

import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { DocumentProperties } from '../../internal';
import { getDocumentsMetadataValuesAggregate } from '../network/getDocumentsMetadataValuesAggregate';
import { DocumentsMetadataAggregateResponse } from '../types';

interface Props {
  metadataKey?: string | null;
  query?: string;
  filter?: AdvancedFilter<DocumentProperties>;
  options?: UseQueryOptions<
    DocumentsMetadataAggregateResponse[],
    unknown,
    DocumentsMetadataAggregateResponse[],
    any
  >;
}

export const useDocumentsMetadataValuesAggregateQuery = ({
  metadataKey,
  query,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsMetadataValues(String(metadataKey), query, filter),
    () => {
      return getDocumentsMetadataValuesAggregate(sdk, String(metadataKey), {
        filter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
