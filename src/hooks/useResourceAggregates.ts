import sdk from '@cognite/cdf-sdk-singleton';
import { useQueries } from 'react-query';

const getDataSetFilter = (id: number) => ({
  filter: { dataSetIds: [{ id }] },
});

export function useResourceAggregates(dataSetId: number) {
  const getQueryKey = (resource: string) => [resource, 'aggregate', dataSetId];

  return useQueries([
    {
      queryKey: getQueryKey('assets'),
      queryFn: () => sdk.assets.aggregate(getDataSetFilter(dataSetId)),
    },
    {
      queryKey: getQueryKey('timeseries'),
      queryFn: () => sdk.timeseries.aggregate(getDataSetFilter(dataSetId)),
    },
    {
      queryKey: getQueryKey('files'),
      queryFn: () => sdk.files.aggregate(getDataSetFilter(dataSetId)),
    },
    {
      queryKey: getQueryKey('events'),
      queryFn: () => sdk.events.aggregate.count(getDataSetFilter(dataSetId)),
    },
    {
      queryKey: getQueryKey('sequences'),
      queryFn: () => sdk.sequences.aggregate(getDataSetFilter(dataSetId)),
    },
  ]);
}
