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
  prefix?: string;
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
  prefix,
  advancedFilter,
  options,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadataValues(String(metadataKey), prefix, advancedFilter),
    () => {
      return getAssetsMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
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
