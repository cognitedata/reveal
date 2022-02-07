import { useContext } from 'react';
import { useQuery } from 'react-query';
import { TimeseriesAggregateQuery } from '@cognite/sdk';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';

const useTimeSeriesAggregateQuery = (
  timeSeriesAggregateQuery?: TimeseriesAggregateQuery
) => {
  const { client } = useContext(CogniteSDKContext);

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
