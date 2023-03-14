import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { InternalAssetFilters, OldAssetFilters } from '../../internal';
import {
  getAssetsMetadataValuesAggregate,
  AssetsMetadataAggregateResponse,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

export const useAssetsMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
  filter?: InternalAssetFilters | OldAssetFilters,
  options?: UseQueryOptions<
    AssetsMetadataAggregateResponse[],
    unknown,
    AssetsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadataValues(String(metadataKey), filter),
    () => {
      return getAssetsMetadataValuesAggregate(sdk, String(metadataKey), {
        filter: transformNewFilterToOldFilter(filter),
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
