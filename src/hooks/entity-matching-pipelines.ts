import { useSDK } from '@cognite/sdk-provider';
import { CogniteError } from '@cognite/sdk';
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import { PipelineSourceType, TargetType } from 'types/api';
import { toast } from '@cognite/cogs.js';
import { EMFeatureType, ModelMapping } from 'context/QuickMatchContext';
import { DEFAULT_MODEL_FEATURE_TYPE } from 'common/constants';

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
};
const getEMPipelinesKey = (): QueryKey => ['em', 'pipelines'];
export const useEMPipelines = (
  opts?: UseQueryOptions<Pipeline[], CogniteError>
) => {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useQuery<Pipeline[], CogniteError>(
    getEMPipelinesKey(),
    ({ pageParam }) =>
      sdk
        .post<{ items: Pipeline[] }>(
          `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines/list`,
          { params: { nextCursor: pageParam }, data: { limit: 1000 } }
        )
        .then((r) => r.data.items),
    {
      onSuccess(items) {
        items.forEach((i) => qc.setQueryData(getEMPipelineKey(i.id), i));
      },
      ...opts,
    }
  );
};

const getEMPipelineKey = (id: number): QueryKey => ['em', 'pipelines', id];
export const useEMPipeline = (
  id: number,
  opts?: UseQueryOptions<Pipeline, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery<Pipeline, CogniteError>(
    getEMPipelineKey(id),
    () =>
      sdk
        .post<{ items: Pipeline[]; nextCursor?: string }>(
          `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines/byids`,
          { data: { items: [{ id }] } }
        )
        .then((r) => r.data.items[0]),
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
      sdk.post<{ items: Pipeline[]; nextCursor?: string }>(
        `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines/delete`,
        { data: { items: [{ id }] } }
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
        .post<Pipeline>(
          `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines`,
          {
            data: {
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
          `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines/update`,
          {
            data: {
              items: [
                {
                  id,
                  update,
                },
              ],
            },
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
        `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines`,
        {
          data: {
            name: `${pipeline.name ?? pipeline.id} copy`,
            description: pipeline.description,
            sources: pipeline.sources,
            targets: pipeline.targets,
          },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getEMPipelinesKey());
      },
    }
  );
};
