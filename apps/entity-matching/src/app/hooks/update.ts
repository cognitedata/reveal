import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import {
  CogniteError,
  InternalId,
  Timeseries,
  TimeseriesFilter,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { Selected3dModel } from '../context/QuickMatchContext';
import { API } from '../types/api';
import { sessionStorage3dDetailsKey } from '../utils';

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

type UpdateAssetIdsMutationVariables = {
  api: API;
  changes: AssetIdUpdate[];
};

export const useUpdateAssetIds = (
  predictionJobId?: number,
  options?: UseMutationOptions<
    InternalId[],
    CogniteError,
    UpdateAssetIdsMutationVariables
  >
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    ['update', predictionJobId],
    ({ api, changes }) => {
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
        case 'threeD': {
          if (!predictionJobId) {
            return Promise.reject('Prediction job ID is not provided');
          }
          const threeDDetailsStr = sessionStorage.getItem(
            sessionStorage3dDetailsKey(predictionJobId)
          );
          const threeDDetails = threeDDetailsStr
            ? (JSON.parse(threeDDetailsStr) as Selected3dModel)
            : undefined;
          if (!threeDDetails) {
            return Promise.reject('3D details not found in session storage');
          }

          return sdk.assetMappings3D
            .create(
              threeDDetails.modelId,
              threeDDetails.revisionId,
              changes.map((c) => ({
                nodeId: c.id,
                assetId: c.update.assetId.set,
              }))
            )
            .then((r) => r.map((i) => ({ id: i.nodeId })));
        }
        default: {
          return Promise.reject('API not supported');
        }
      }
    },
    {
      ...options,
      onSuccess(a, b, c) {
        queryClient.invalidateQueries([b.api]);
        options?.onSuccess?.(a, b, c);
      },
    }
  );
};
