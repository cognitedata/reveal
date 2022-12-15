import { useSDK } from '@cognite/sdk-provider';
import { useQuery, UseQueryOptions } from 'react-query';
import { AggregateResponse } from '@cognite/sdk';
import { InternalAssetFilters, OldAssetFilters } from 'domain/assets';
import { transformNewFilterToOldFilter } from 'domain/transformers';

export const useAssetMetadataKeys = (
  filter?: InternalAssetFilters | OldAssetFilters,
  config?: UseQueryOptions<
    AggregateResponse[],
    unknown,
    AggregateResponse[],
    (string | InternalAssetFilters | OldAssetFilters | undefined)[]
  >
) => {
  const sdk = useSDK();

  filter = transformNewFilterToOldFilter(filter);

  const { data, ...rest } = useQuery(
    ['assets', 'aggregate', 'metadataKeys', filter],
    async () =>
      // @ts-ignore
      sdk.assets.aggregate({ filter, aggregate: 'metadataKeys' }),
    {
      staleTime: 60 * 1000,
      ...config,
    }
  );

  return { data: data as any, ...rest };
};

export const useAssetMetadataValues = (
  key: string | null,
  config?: UseQueryOptions<
    AggregateResponse[],
    unknown,
    unknown,
    (string | null)[]
  >
) => {
  const sdk = useSDK();
  const { data, ...rest } = useQuery(
    ['assets', 'aggregate', 'metadataValues', key],
    async () =>
      sdk.assets.aggregate({
        // @ts-ignore
        keys: [key],
        aggregate: 'metadataValues',
      }),
    {
      enabled: !!key && config?.enabled,
      staleTime: 60 * 1000,
      ...config,
    }
  );

  return { data: data as any, ...rest };
};
