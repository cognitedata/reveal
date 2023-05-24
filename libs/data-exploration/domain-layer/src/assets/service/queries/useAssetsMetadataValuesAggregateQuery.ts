import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useSDK } from '@cognite/sdk-provider';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { InternalAssetFilters } from '@data-exploration-lib/core';
import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { transformNewFilterToOldFilter } from '../../../transformers';
import { AssetsProperties } from '../../internal';
import { getAssetsMetadataValuesAggregate } from '../network';
import { AssetsMetadataAggregateResponse } from '../types';

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
  filter?: InternalAssetFilters;
  options?: UseQueryOptions<
    AssetsMetadataAggregateResponse[],
    unknown,
    AssetsMetadataAggregateResponse[],
    any
  >;
}

export const useAssetsMetadataValuesAggregateQuery = ({
  metadataKey,
  query,
  advancedFilter,
  filter,
  options,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadataValues(
      String(metadataKey),
      query,
      advancedFilter,
      filter
    ),
    () => {
      return getAssetsMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
