import { useQuery } from 'react-query';
import { Timeseries, TimeseriesSearchFilter } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useTimeSeriesSearchQuery = (searchQuery?: TimeseriesSearchFilter) => {
  const { client } = useCDFExplorerContext();

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
