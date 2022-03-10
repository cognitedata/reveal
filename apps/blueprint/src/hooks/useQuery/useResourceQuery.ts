import { useContext } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import { Asset, IdEither, Timeseries } from '@cognite/sdk';
import { AuthContext } from 'providers/AuthProvider';

export const useResourceQuery = (
  type: 'TIMESERIES' | 'ASSET',
  reference?: IdEither,
  options?: UseQueryOptions<Timeseries | Asset>
) => {
  const { client } = useContext(AuthContext);

  const query = useQuery<Timeseries | Asset>(
    ['useResourceQuery', type, reference],
    () => {
      if (!reference) {
        throw new Error('Unreachable code');
      }
      if (type === 'TIMESERIES') {
        return client.timeseries.retrieve([reference]).then((res) => res[0]);
      }

      if (type === 'ASSET') {
        return client.assets.retrieve([reference]).then((res) => res[0]);
      }
      throw new Error('Type must be TIMESERIES or ASSET');
    },
    {
      enabled: Boolean(reference),
      ...options,
    }
  );
  return query;
};
