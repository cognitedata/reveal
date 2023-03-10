import { useSDK } from '@cognite/sdk-provider';
import {
  CogniteError,
  EntityMatchingModel,
  EntityMatchingPredictResponse,
} from '@cognite/sdk';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query';
import { ModelMapping, EMFeatureType } from 'context/QuickMatchContext';
import {
  RawCogniteEvent,
  RawFileInfo,
  RawSource,
  RawTarget,
  RawTimeseries,
  SourceType,
} from 'types/api';

export const IN_PROGRESS_EM_STATES = ['queued', 'running'];

export type PredictionObject = {
  id: number;
  externalId?: string;
  name: string;
  description?: string;
};

export type Prediction = {
  source: PredictionObject;
  matches: {
    score: number;
    target: PredictionObject;
  }[];
};

export type EntityMatchingPredictions = {
  createdTime: number;
  jobId: number;
  startTime: number;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
  statusTime: number;
  items?: Prediction[];
};

const getEMModelsKey = (): QueryKey => ['em', 'models'];
export const useEMModels = (
  opts?: UseInfiniteQueryOptions<
    {
      nextCursor?: string;
      items: EntityMatchingModel[];
    },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    getEMModelsKey(),
    ({ pageParam }) => sdk.entityMatching.list({ cursor: pageParam }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
      ...opts,
    }
  );
};

export type Pipeline = {
  id: number;
  name: string;
  description: string;
  owner: string;
  run: string;
  sources: {
    dataSetIds: [{ id: number }];
    resource: string;
  };
  targets: {
    dataSetIds: [{ id: number }];
    resource: string;
  };
};
const getEMPipelinesKey = (): QueryKey => ['em', 'pipelines'];
export const useEMPipelines = (
  opts?: UseQueryOptions<Pipeline[], CogniteError>
) => {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useQuery(
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
  return useQuery(
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

const getEMModelKey = (id: number): QueryKey => ['em', 'models', id];
export const useEMModel = (
  id: number,
  opts?: UseQueryOptions<EntityMatchingModel, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getEMModelKey(id),
    () => sdk.entityMatching.retrieve([{ id }]).then((r) => r[0]),
    opts
  );
};

const getEMModelPredictionKey = (id: number): QueryKey => [
  'em',
  'models',
  'prediction',
  id,
];
export const useEMModelPredictResults = (
  id: number,
  opts?: UseQueryOptions<EntityMatchingPredictions, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getEMModelPredictionKey(id),
    () =>
      sdk
        .get<EntityMatchingPredictions>(
          `/api/v1/projects/${sdk.project}/context/entitymatching/jobs/${id}`
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data;
          } else {
            return Promise.reject(r);
          }
        }),
    opts
  );
};

export const getQMSourceDownloadKey = (): QueryKey => [
  'quick-match',
  'source-download',
];
export const getQMTargetDownloadKey = (): QueryKey => [
  'quick-match',
  'target-download',
];

type ConfirmedMatch = {
  sourceId: number;
  targetId: number;
};

export const useCreateEMModel = () => {
  const sdk = useSDK();

  return useMutation(
    ['create-em-model'],
    async ({
      sourceType,
      sources,
      targetsList,
      matchFields,
      featureType,
      supervisedMode,
    }: {
      sourceType: SourceType;
      sources: RawSource[];
      targetsList: RawTarget[];
      matchFields: ModelMapping;
      featureType: EMFeatureType;
      supervisedMode?: boolean;
    }) => {
      const trueMatches = supervisedMode
        ? sources.reduce((accl: ConfirmedMatch[], item) => {
            if (sourceType === 'events' || sourceType === 'timeseries') {
              return (item as RawFileInfo | RawCogniteEvent).assetIds
                ? [
                    ...accl,
                    ...((item as RawFileInfo | RawCogniteEvent).assetIds?.map(
                      (assetId) => ({
                        sourceId: item.id,
                        targetId: assetId,
                      })
                    ) ?? []),
                  ]
                : accl;
            }
            return !!(item as RawTimeseries).assetId
              ? [
                  ...accl,
                  {
                    sourceId: item.id,
                    targetId: (item as RawTimeseries).assetId as number,
                  },
                ]
              : accl;
          }, [])
        : undefined;

      const filteredSources = sources.map((source) => {
        const keys = Object.keys(source);
        const filteredSource: Record<string, unknown> = {};
        keys
          .filter((key) => matchFields.some(({ source }) => source === key))
          .forEach((key) => {
            filteredSource[key] = (source as any)[key];
          });
        filteredSource.id = source.id;
        return filteredSource;
      });

      const filteredTargets = targetsList.map((target) => {
        const keys = Object.keys(target);
        const filteredTarget: Record<string, unknown> = {};
        keys
          .filter((key) => matchFields.some(({ target }) => target === key))
          .forEach((key) => {
            filteredTarget[key] = (target as any)[key];
          });
        filteredTarget.id = target.id;
        return filteredTarget;
      });

      return sdk
        .post<EntityMatchingModel>(
          `/api/v1/projects/${sdk.project}/context/entitymatching`,
          {
            data: {
              ignoreMissingFields: true,
              featureType,
              sources: filteredSources,
              targets: filteredTargets,
              trueMatches,
              matchFields: matchFields.filter(
                ({ source, target }) => !!source && !!target
              ),
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

export const useCreateEMPredictionJob = (
  options?: UseMutationOptions<
    EntityMatchingPredictResponse,
    CogniteError,
    number
  >
) => {
  const sdk = useSDK();
  return useMutation(
    ['create-em-prediction'],
    (id: number) => {
      return sdk.entityMatching.predict({ id });
    },
    options
  );
};
