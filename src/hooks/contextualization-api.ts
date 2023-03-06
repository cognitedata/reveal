import { useSDK } from '@cognite/sdk-provider';
import {
  CogniteError,
  EntityMatchingModel,
  EntityMatchingPredictResponse,
  InternalId,
} from '@cognite/sdk';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { ModelMapping, EMFeatureType } from 'context/QuickMatchContext';

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
  const queryClient = useQueryClient();

  return useMutation(
    ['create-em-model'],
    async ({
      sources,
      targetsList,
      matchFields,
      featureType,
      supervisedMode,
    }: {
      sources: any[];
      targetsList: InternalId[];
      matchFields: ModelMapping;
      featureType: EMFeatureType;
      supervisedMode?: boolean;
    }) => {
      const targets = await queryClient.fetchQuery(
        getQMTargetDownloadKey(),
        async () => {
          const assets = await sdk.assets.retrieve(targetsList);
          return assets.map(({ id, externalId, name }) => ({
            id,
            externalId,
            name,
          }));
        }
      );

      const trueMatches = supervisedMode
        ? sources.reduce(
            (accl: ConfirmedMatch[], ts) =>
              ts.assetId
                ? [
                    ...accl,
                    {
                      sourceId: ts.id,
                      targetId: ts.assetId,
                    },
                  ]
                : accl,
            []
          )
        : undefined;

      return sdk
        .post<EntityMatchingModel>(
          `/api/v1/projects/${sdk.project}/context/entitymatching`,
          {
            data: {
              ignoreMissingFields: true,
              featureType,
              sources,
              targets,
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
