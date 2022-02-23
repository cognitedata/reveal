import { useContext } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import { Timeseries, TimeseriesFilterQuery } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useTimeSeriesQuery = (
  tsQuery: TimeseriesFilterQuery,
  options: UseQueryOptions<Timeseries[]> = {}
) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<Timeseries[]>(
    ['timeSeriesListQuery', tsQuery],
    () => client.timeseries.list(tsQuery).then((res) => res.items),
    {
      enabled: Boolean(tsQuery),
      ...options,
    }
  );
  return query;
};

export default useTimeSeriesQuery;
