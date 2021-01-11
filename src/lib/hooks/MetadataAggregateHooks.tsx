import { useSDK } from '@cognite/sdk-provider';
import { useQuery, QueryConfig } from 'react-query';
import { AssetFilterProps, AggregateResponse } from '@cognite/sdk';

export const useMetadataKeys = (
  filter?: AssetFilterProps,
  config?: QueryConfig<AggregateResponse[]>
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

export const useMetadataValues = (
  key: string | null,
  config?: QueryConfig<AggregateResponse[]>
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
