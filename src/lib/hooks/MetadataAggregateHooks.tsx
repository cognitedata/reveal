import { useSDK } from '@cognite/sdk-provider';
import { useQuery, UseQueryOptions } from 'react-query';
import { AssetFilterProps, AggregateResponse } from '@cognite/sdk';

export const useAssetMetadataKeys = (
  filter?: AssetFilterProps,
  config?: UseQueryOptions<AggregateResponse[]>
) => {
  const sdk = useSDK();
  const { data, ...rest } = useQuery(
    ['assets', 'aggregate', 'metadataKeys', filter],
    async () => {
      // @ts-ignore
      return sdk.assets.aggregate({ filter, aggregate: 'metadataKeys' });
    },
    {
      staleTime: 60 * 1000,
      ...config,
    }
  );

  return { data: data as any, ...rest };
};

export const useAssetMetadataValues = (
  key: string | null,
  config?: UseQueryOptions<AggregateResponse[]>
) => {
  const sdk = useSDK();
  const { data, ...rest } = useQuery(
    ['assets', 'aggregate', 'metadataValues', key],
    async () => {
      return sdk.assets.aggregate({
        // @ts-ignore
        keys: [key],
        aggregate: 'metadataValues',
      });
    },
    {
      enabled: !!key && config?.enabled,
      staleTime: 60 * 1000,
      ...config,
    }
  );

  return { data: data as any, ...rest };
};
