import {
  CogniteError,
  Timeseries,
  TimeseriesFilter,
  TimeSeriesUpdate,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export type TSParams = {
  limit?: number;
  advancedFilter?: any;
  filter?: TimeseriesFilter;
};

export type RawTimeseries = Omit<
  Timeseries,
  'lastUpdatedTime' | 'createdTime'
> & {
  lastUpdatedTime: number;
  createdTime: number;
};

export const TS_BASE_QUERY_KEY = ['timeseries'];

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
