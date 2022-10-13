import sdk from '@cognite/cdf-sdk-singleton';
import { useQueries } from 'react-query';

const callWithDataSetFilters = (fn: (object: any) => any) => (id: number) =>
  fn({ filter: { dataSetIds: [{ id }] } });

export function useResourceAggregates(dataSetId: number) {
  const getQueryKey = (resource: string) => [resource, 'aggregate', dataSetId];

  return useQueries([
    {
      queryKey: getQueryKey('assets'),
      queryFn: () => callWithDataSetFilters(sdk.assets.aggregate)(dataSetId),
    },
    {
      queryKey: getQueryKey('timeseries'),
      queryFn: () =>
        callWithDataSetFilters(sdk.timeseries.aggregate)(dataSetId),
    },
    {
      queryKey: getQueryKey('files'),
      queryFn: () => callWithDataSetFilters(sdk.files.aggregate)(dataSetId),
    },
    {
      queryKey: getQueryKey('events'),
      queryFn: () =>
        sdk.events.aggregate.count({
          filter: {
            dataSetIds: [{ id: dataSetId }],
          },
        }),
    },
    {
      queryKey: getQueryKey('sequences'),
      queryFn: () => callWithDataSetFilters(sdk.sequences.aggregate)(dataSetId),
    },
  ]);
}
