import { useQuery, UseQueryOptions } from 'react-query';
import sdk from '@cognite/cdf-sdk-singleton';
import {
  getResourceSearchParams,
  getResourceSearchQueryKey,
} from 'utils/shared';

export const useSearchResource = (
  resource: 'assets' | 'timeseries' | 'files' | 'events' | 'sequences',
  dataSetId: number,
  query: string,
  config?: UseQueryOptions<any, any, any, any>
) => {
  return useQuery(
    getResourceSearchQueryKey(resource, dataSetId, query),
    () => sdk[resource].search(getResourceSearchParams(dataSetId, query)),
    config
  );
};
