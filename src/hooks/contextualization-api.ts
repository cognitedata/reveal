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
import { filterFieldsFromObjects } from 'utils';

export const IN_PROGRESS_EM_STATES: JobStatus[] = ['Queued', 'Running'];

export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

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
  status: JobStatus;
  statusTime: number;
  items?: Prediction[];
};

// Type in SDK is not correct
type EMModel = Omit<EntityMatchingModel, 'status'> & {
  status: JobStatus;
};

const getEMModelsKey = (): QueryKey => ['em', 'models'];
export const useEMModels = (
  opts?: UseInfiniteQueryOptions<
    {
      nextCursor?: string;
      items: EMModel[];
    },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    getEMModelsKey(),
    // @ts-ignore SDK Type incorrect
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

const getEMModelKey = (id: number): QueryKey => ['em', 'models', id];
export const useEMModel = (
  id: number,
  opts?: UseQueryOptions<EMModel, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getEMModelKey(id),
    // @ts-ignore SDK  type incorrect
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
  token: string,
  opts?: UseQueryOptions<EntityMatchingPredictions, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getEMModelPredictionKey(id),
    async () => {
      if (!token) {
        return Promise.reject('Contextualization job token not found');
      }
      const r = await fetch(
        `${sdk.getBaseUrl()}/api/v1/projects/${
          sdk.project
        }/context/entitymatching/jobs/${id}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );
      const body = await r.json();
      if (r.status === 200) {
        return body;
      } else {
        return Promise.reject(body.error);
      }
    },
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
      targets,
      matchFields,
      featureType,
      supervisedMode,
    }: {
      sourceType: SourceType;
      sources: RawSource[];
      targets: RawTarget[];
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

      const filteredSources = filterFieldsFromObjects(sources, [
        'id',
        ...matchFields
          .filter((source) => !!source)
          .map(({ source }) => source as string),
      ]);

      const filteredTargets = filterFieldsFromObjects(targets, [
        'id',
        ...matchFields
          .filter((target) => !!target)
          .map(({ target }) => target as string),
      ]);

      return sdk
        .post<EMModel>(
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
            // Can't read the header at the moment because of CORS header settings, matchmakers will
            // look into that
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
