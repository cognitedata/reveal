import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalTimeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { createTimeseries } from '../network/createTimeseries';

export const useTimeseriesCreateMutate = () => {
  const sdk = useSDK();
  const client = useQueryClient();
  return useMutation(
    (timeseries: ExternalTimeseries[]) => createTimeseries(timeseries, sdk),
    {
      onSettled: () => {
        client.invalidateQueries(['timeseries']);
      },
    }
  );
};
