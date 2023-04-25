import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  getAssetsMetadataValuesAggregate,
  AssetsMetadataAggregateResponse,
  queryKeys,
  AdvancedFilter,
  AssetsProperties,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
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
  options,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadataValues(String(metadataKey), query, advancedFilter),
    () => {
      return getAssetsMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
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
