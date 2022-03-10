import { useContext } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import { AuthContext } from 'providers/AuthProvider';
import { Asset, Timeseries } from '@cognite/sdk';

export const useResourceSearchQuery = (
  searchQuery: string,
  type: 'TIMESERIES' | 'ASSET',
  options?: UseQueryOptions<(Asset | Timeseries)[]>
) => {
  const { client } = useContext(AuthContext);

  const query = useQuery<(Asset | Timeseries)[]>(
    ['useResourceSearchQuery', searchQuery, type],
    () => {
      if (!searchQuery) {
        throw new Error('Type must be TIMESERIES or ASSET');
      }
      if (type === 'TIMESERIES') {
        return client.timeseries.search({ search: { query: searchQuery } });
      }

      if (type === 'ASSET') {
        return client.assets.search({ search: { query: searchQuery } });
      }
      throw new Error('Type must be TIMESERIES or ASSET');
    },
    {
      enabled: Boolean(searchQuery),
      ...options,
    }
  );
  return query;
};
