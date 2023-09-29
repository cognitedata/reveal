import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { AppliedRule, Rule } from '../types/rules';

import { INFINITE_Q_OPTIONS } from './infiniteList';
import { JobStatus } from './types';

type RulesResponse = {
  createdTime: number;
  jobId: number;
  startTime: number | null;
  status: JobStatus;
  statusTime: number;
  jobToken?: string;
};
type RulesInput = {
  sources: any[];
  targets: any[];
  matches: { sourceId: number; targetId: number }[];
};

type ApplyRulesInput = {
  sources: any[];
  targets: any[];
  rules: Rule[];
};

export const useCreateRulesJob = (
  options?: UseMutationOptions<RulesResponse, CogniteError, RulesInput>
) => {
  const sdk = useSDK();
  return useMutation(
    ['create-em-prediction'],
    async (inputs) => {
      return sdk
        .post<RulesResponse>(
          `/api/playground/projects/${sdk.project}/context/matchrules/suggest`,
          {
            data: inputs,
          }
        )
        .then(async (r): Promise<RulesResponse> => {
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

const getRulesKey = (id: number): QueryKey => ['em', 'models', 'rules', id];
export const useRulesResults = (
  id: number,
  jobToken?: string | null,
  opts?: UseQueryOptions<RulesResponse & { rules: Rule[] }, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getRulesKey(id),
    async () =>
      sdk
        .get<RulesResponse & { rules: Rule[] }>(
          `/api/playground/projects/${sdk.project}/context/matchrules/suggest/${id}`,
          {
            headers: jobToken
              ? {
                  'X-Job-Token': jobToken,
                }
              : undefined,
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data;
          } else {
            return Promise.reject(r);
          }
        }),
    { ...opts, ...INFINITE_Q_OPTIONS }
  );
};

export const useApplyRulesJob = (
  options?: UseMutationOptions<RulesResponse, CogniteError, ApplyRulesInput>
) => {
  const sdk = useSDK();
  return useMutation(
    ['apply-em-prediction'],
    async (inputs) => {
      return sdk
        .post<RulesResponse>(
          `/api/playground/projects/${sdk.project}/context/matchrules/apply`,
          {
            data: inputs,
          }
        )
        .then(async (r): Promise<RulesResponse> => {
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

const getApplyRulesKey = (id: number): QueryKey => [
  'em',
  'models',
  'rules',
  'apply',
  id,
];
export const useApplyRulesResults = (
  id: number,
  jobToken?: string | null,
  opts?: UseQueryOptions<RulesResponse & { items: AppliedRule[] }, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getApplyRulesKey(id),
    async () =>
      sdk
        .get<RulesResponse & { items: AppliedRule[] }>(
          `/api/playground/projects/${sdk.project}/context/matchrules/apply/${id}`,
          {
            headers: jobToken
              ? {
                  'X-Job-Token': jobToken,
                }
              : undefined,
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return {
              ...r.data,
              items: r.data.items.sort(
                (a, b) => b.numberOfMatches - a.numberOfMatches
              ),
            };
          } else {
            return Promise.reject(r);
          }
        }),
    { ...opts, ...INFINITE_Q_OPTIONS }
  );
};
