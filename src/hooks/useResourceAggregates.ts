import { useQueries } from 'react-query';
import { getCogniteSDKClient } from 'utils/cogniteSdk';

const getDataSetFilter = (id: number) => ({
  filter: { dataSetIds: [{ id }] },
});

export function useResourceAggregates(dataSetId: number) {
  const getQueryKey = (resource: string) => [resource, 'aggregate', dataSetId];

  return useQueries([
    {
      queryKey: getQueryKey('assets'),
      queryFn: () => {
        const sdk = getCogniteSDKClient();
        return sdk.assets.aggregate(getDataSetFilter(dataSetId));
      },
    },
    {
      queryKey: getQueryKey('timeseries'),
      queryFn: () => {
        const sdk = getCogniteSDKClient();
        return sdk.timeseries.aggregate(getDataSetFilter(dataSetId));
      },
    },
    {
      queryKey: getQueryKey('files'),
      queryFn: () => {
        const sdk = getCogniteSDKClient();
        return sdk.files.aggregate(getDataSetFilter(dataSetId));
      },
    },
    {
      queryKey: getQueryKey('events'),
      queryFn: () => {
        const sdk = getCogniteSDKClient();
        return sdk.events.aggregate.count(getDataSetFilter(dataSetId));
      },
    },
    {
      queryKey: getQueryKey('sequences'),
      queryFn: () => {
        const sdk = getCogniteSDKClient();
        return sdk.sequences.aggregate(getDataSetFilter(dataSetId));
      },
    },
  ]);
}
