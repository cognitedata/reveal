import { useEffect } from 'react';

import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
  UseInfiniteQueryOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';
import { CogniteClient, CogniteError, ListResponse } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { DEFAULT_MODEL_FEATURE_TYPE } from '../common/constants';
import { EMFeatureType, ModelMapping } from '../context/QuickMatchContext';
import { PipelineSourceType, TargetType } from '../types/api';
import { RuleCondition, RuleExtractor, RuleMatch } from '../types/rules';

import { JobStatus } from './types';

export type Pipeline = {
  id: number;
  name: string;
  description: string;
  owner: string;
  run: string;
  sources: {
    dataSetIds: { id: number }[];
    resource: PipelineSourceType;
  };
  targets: {
    dataSetIds: { id: number }[];
    resource: TargetType;
  };
  modelParameters?: {
    featureType?: EMFeatureType;
    matchFields?: ModelMapping;
  };
  generateRules?: boolean;
  useExistingMatches?: boolean;
  lastRun?: EMPipelineRun;
};

const betaHeader = { 'cdf-version': 'beta' };

const getEMPipelinesKey = (): QueryKey => ['entitymatching', 'pipelines'];

const getPipelines = (sdk: CogniteClient, cursor?: string) => {
  const limit = 100;
  const params = cursor !== undefined ? { limit, cursor: cursor } : { limit };

  return sdk
    .get<{ items: Pipeline[]; nextCursor?: string }>(
      `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines`,
      { params, headers: betaHeader }
    )
    .then(({ data }) => data);
};

export const useEMPipelines = (
  opts?: UseInfiniteQueryOptions<ListResponse<Pipeline[]>, CogniteError>
) => {
  const sdk = useSDK();
  const query = useInfiniteQuery<ListResponse<Pipeline[]>, CogniteError>(
    getEMPipelinesKey(),
    ({ pageParam = undefined }) => getPipelines(sdk, pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...opts,
    }
  );

  useEffect(() => {
    if (query.hasNextPage && !query.isFetching) {
      query.fetchNextPage();
    }
  }, [query]);

  return query;
};

const getEMPipelineKey = (id: number): QueryKey => [...getEMPipelinesKey(), id];
export const useEMPipeline = (
  id: number,
  opts?: UseQueryOptions<Pipeline, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery<Pipeline, CogniteError>(
    getEMPipelineKey(id),
    () =>
      sdk
        .get<Pipeline>(
          `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines/${id}`,
          { headers: betaHeader }
        )
        .then((r) => r.data),
    opts
  );
};

export const useDeleteEMPipeline = (
  opts?: UseMutationOptions<unknown, CogniteError, { id: number }>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    ({ id }: { id: number }) =>
      sdk.post<{}>(
        `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines/delete`,
        { data: { items: [{ id }] }, headers: betaHeader }
      ),
    {
      ...opts,
      onSuccess: (...params) => {
        queryClient.invalidateQueries(getEMPipelinesKey());
        opts?.onSuccess?.(...params);
      },
    }
  );
};

type PipelineCreateParams = Partial<Pick<Pipeline, 'name' | 'description'>>;
export const useCreatePipeline = (
  options?: UseMutationOptions<Pipeline, CogniteError, PipelineCreateParams>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<Pipeline, CogniteError, PipelineCreateParams>(
    async ({ name, description }) => {
      return sdk
        .post<{ items: Pipeline[] }>(
          `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines`,
          {
            data: {
              items: [
                {
                  name,
                  description,
                  sources: {
                    dataSetIds: [],
                    resource: 'time_series',
                  },
                  targets: {
                    dataSetIds: [],
                    resource: 'assets',
                  },
                  modelParameters: {
                    featureType: DEFAULT_MODEL_FEATURE_TYPE,
                    matchFields: [{ source: 'name', target: 'name' }],
                  },
                },
              ],
            },
            headers: betaHeader,
          }
        )
        .then((r) => {
          if (r.status === 201 && r.data.items.length === 1) {
            return r.data.items[0];
          } else {
            return Promise.reject(r);
          }
        });
    },
    {
      ...options,
      onSuccess: (...params) => {
        queryClient.invalidateQueries(getEMPipelinesKey());
        options?.onSuccess?.(...params);
      },
    }
  );
};

type PipelineUpdateParams = Required<Pick<Pipeline, 'id'>> &
  Partial<Omit<Pipeline, 'id'>>;
type PipelineUpdateContext = { previous?: PipelineUpdateParams };
export const useUpdatePipeline = (
  options?: UseMutationOptions<
    Pipeline,
    CogniteError,
    PipelineUpdateParams,
    PipelineUpdateContext
  >
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<
    Pipeline,
    CogniteError,
    PipelineUpdateParams,
    PipelineUpdateContext
  >(
    async (params) => {
      const { id, ...rest } = params;
      const update = Object.entries(rest).reduce((acc, [key, value]) => {
        acc[key] = { set: value };
        return acc;
      }, {} as Record<string, unknown>);
      return sdk
        .post<Pipeline>(
          `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines/update`,
          {
            data: {
              items: [
                {
                  id,
                  update,
                },
              ],
            },
            headers: betaHeader,
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data;
          } else {
            return Promise.reject(r);
          }
        });
    },
    {
      ...options,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: getEMPipelineKey(variables.id),
        });

        const previousPipeline = queryClient.getQueryData<Pipeline | undefined>(
          getEMPipelineKey(variables.id)
        );

        const nextPipeline = { ...previousPipeline, ...variables };
        queryClient.setQueryData(getEMPipelineKey(variables.id), nextPipeline);

        return { previous: previousPipeline };
      },
      onError: (error, variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            getEMPipelineKey(variables.id),
            context.previous
          );
        }
        toast.error(error.message, {
          toastId: `pipeline-update-error-${variables.id}`,
        });
      },
      onSettled: (_, __, variables) => {
        queryClient.invalidateQueries(getEMPipelineKey(variables.id));
      },
    }
  );
};

export const useDuplicateEMPipeline = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useMutation(
    async (
      pipeline: Pick<
        Pipeline,
        'id' | 'name' | 'description' | 'sources' | 'targets'
      >
    ) =>
      sdk.post<Pipeline>(
        `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines`,
        {
          data: {
            items: [
              {
                name: `${pipeline.name ?? pipeline.id} copy`,
                description: pipeline.description,
                sources: pipeline.sources,
                targets: pipeline.targets,
              },
            ],
          },
          headers: betaHeader,
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getEMPipelinesKey());
      },
    }
  );
};

type EMPipelineMatchType = 'previously-confirmed' | 'model';

export type EMPipelineResource = Record<string, unknown>;
export type EMPipelineSource = EMPipelineResource;
export type EMPipelineTarget = EMPipelineResource;

export type EMPipelineRunMatch = {
  matchType?: EMPipelineMatchType;
  score?: number;
  source?: EMPipelineSource;
  target?: EMPipelineTarget;
};

export type EMPipelineGeneratedRule = {
  extractors?: RuleExtractor[];
  conditions?: RuleCondition[];
  matches?: RuleMatch[];
  priority: number;
};

export type EMPipelineRun = {
  status: JobStatus;
  createdTime: number;
  startTime: number | null;
  statusTime: number;
  jobId: number;
  matches?: EMPipelineRunMatch[];
  generatedRules?: EMPipelineGeneratedRule[];
};

type RunEMPipelineMutationVariables = Pick<Pipeline, 'id'>;

export const useRunEMPipeline = (
  options?: UseMutationOptions<
    EMPipelineRun,
    CogniteError,
    RunEMPipelineMutationVariables
  >
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation<
    EMPipelineRun,
    CogniteError,
    RunEMPipelineMutationVariables
  >(
    async (variables: RunEMPipelineMutationVariables) =>
      sdk
        .post<EMPipelineRun>(
          `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines/${variables.id}/runs`,
          { headers: betaHeader }
        )
        .then((r) => r.data),

    {
      ...options,
      onSuccess: (...args) => {
        queryClient.invalidateQueries(getEMPipelinesKey());
        options?.onSuccess?.(...args);
      },
    }
  );
};

const getEMPipelineRunKey = (pipelineId: number, jobId?: number): QueryKey => [
  ...getEMPipelineKey(pipelineId),
  'runs',
  jobId,
];
export const useEMPipelineRun = (
  pipelineId: number,
  jobId?: number,
  options?: UseQueryOptions<EMPipelineRun, CogniteError, EMPipelineRun>
) => {
  const sdk = useSDK();

  return useQuery<EMPipelineRun, CogniteError, EMPipelineRun>(
    getEMPipelineRunKey(pipelineId, jobId),
    async () =>
      sdk
        .get<EMPipelineRun>(
          `/api/v1/projects/${sdk.project}/context/entitymatching/pipelines/${pipelineId}/runs/${jobId}`,
          { headers: betaHeader }
        )
        .then((r) => r.data),
    options
  );
};
