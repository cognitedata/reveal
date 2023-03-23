import {
  CogniteError,
  InternalId,
  Timeseries,
  TimeseriesFilter,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { API } from 'types/api';
import { AssetIdUpdate } from './types';

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

export const useUpdateAssetIds = (
  api: API,
  options?: UseMutationOptions<InternalId[], CogniteError, AssetIdUpdate[]>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    ['update', api],
    (changes) => {
      switch (api) {
        case 'events': {
          return sdk.events.update(
            changes.map((c) => ({
              ...c,
              update: { assetIds: { set: [c.update.assetId.set] } },
            }))
          );
        }
        case 'timeseries': {
          return sdk.timeseries.update(changes);
        }
        case 'files': {
          return sdk.files.update(
            changes.map((c) => ({
              ...c,
              update: { assetIds: { set: [c.update.assetId.set] } },
            }))
          );
        }
        case 'sequences': {
          return sdk.sequences.update(changes);
        }
        default: {
          return Promise.reject('API not supported');
        }
      }
    },
    {
      ...options,
      onSuccess(a, b, c) {
        queryClient.invalidateQueries(['timeseries']);
        options?.onSuccess?.(a, b, c);
      },
    }
  );
};
