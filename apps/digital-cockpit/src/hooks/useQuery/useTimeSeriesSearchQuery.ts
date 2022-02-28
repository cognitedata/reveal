import { useContext } from 'react';
import { useQuery } from 'react-query';
import { Timeseries, TimeseriesSearchFilter } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useTimeSeriesSearchQuery = (searchQuery?: TimeseriesSearchFilter) => {
  const { client } = useContext(CogniteSDKContext);

  const query = useQuery<Timeseries[]>(
    ['timeSeriesSearch', searchQuery],
    () => client.timeseries.search(searchQuery || {}),
    {
      enabled: Boolean(searchQuery),
    }
  );
  return query;
};

export default useTimeSeriesSearchQuery;
