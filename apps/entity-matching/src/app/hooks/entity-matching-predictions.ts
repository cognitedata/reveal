import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';

import { CogniteError, EntityMatchingPredictResponse } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { INFINITE_Q_OPTIONS } from './infiniteList';
import { JobStatus } from './types';

export type PredictionObject = {
  id: number;
} & Record<string, string>;

export type Match = {
  score: number;
  target: PredictionObject;
};

export type RawPrediction = {
  source: PredictionObject;
  matches: Match[];
};

export type Prediction = {
  source: PredictionObject;
  match: Match;
};

export type EntityMatchingPredictions = {
  createdTime: number;
  jobId: number;
  startTime: number;
  status: JobStatus;
  statusTime: number;
  items: Prediction[];
};

const getEMModelPredictionKey = (id: number): QueryKey => [
  'em',
  'models',
  'prediction',
  id,
];
export const useEMModelPredictResults = (
  id: number,
  jobToken?: string | null,
  opts?: UseQueryOptions<EntityMatchingPredictions, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getEMModelPredictionKey(id),
    async () => {
      const r = await sdk.get<
        Omit<EntityMatchingPredictions, 'items'> & {
          items?: RawPrediction[];
        }
      >(`/api/v1/projects/${sdk.project}/context/entitymatching/jobs/${id}`, {
        headers: jobToken
          ? {
              'X-Job-Token': jobToken,
            }
          : undefined,
      });

      if (r.status === 200) {
        const items =
          r.data.items
            ?.filter((p) => p.matches.length > 0)
            .map((p) => ({
              source: p.source,
              match: p.matches[0],
            }))
            .sort((a, b) => b.match.score - a.match.score) || [];

        return { ...r.data, items };
      } else {
        return Promise.reject(r.data);
      }
    },
    { ...opts, ...INFINITE_Q_OPTIONS }
  );
};

type PredictResponse = EntityMatchingPredictResponse & {
  jobToken?: string;
};
export const useCreateEMPredictionJob = (
  options?: UseMutationOptions<PredictResponse, CogniteError, number>
) => {
  const sdk = useSDK();
  return useMutation(
    ['create-em-prediction'],
    async (id: number) => {
      return sdk
        .post<EntityMatchingPredictResponse>(
          `/api/v1/projects/${sdk.project}/context/entitymatching/predict`,
          {
            data: { id },
          }
        )
        .then(async (r): Promise<PredictResponse> => {
          if (r.status === 200) {
            const jobToken = r.headers['x-job-token'];
            return Promise.resolve({
              ...r.data,
              jobToken,
            });
          } else {
            return Promise.reject(r);
          }
        });
    },
    options
  );
};
