import { Timeseries, CogniteError, TimeSeriesUpdate } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export const useUpdateTimeseries = (
  options?: UseMutationOptions<Timeseries[], CogniteError, TimeSeriesUpdate[]>
) => {
  const sdk = useSDK();

  return useMutation(
    ['update', 'ts'],
    (changes) => sdk.timeseries.update(changes),
    options
  );
};
