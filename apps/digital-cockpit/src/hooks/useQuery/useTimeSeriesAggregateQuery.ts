import { useQuery } from 'react-query';
import { TimeseriesAggregateQuery } from '@cognite/sdk';
import useCDFExplorerContext from 'hooks/useCDFExplorerContext';

const useTimeSeriesAggregateQuery = (
  timeSeriesAggregateQuery?: TimeseriesAggregateQuery
) => {
  const { client } = useCDFExplorerContext();

  const query = useQuery<number>(
    ['timeSeriesAggregate', timeSeriesAggregateQuery],
    () =>
      client.timeseries
        .aggregate(timeSeriesAggregateQuery || {})
        .then((res) => res[0].count),
    {
      enabled: Boolean(timeSeriesAggregateQuery),
    }
  );
  return query;
};

export default useTimeSeriesAggregateQuery;
