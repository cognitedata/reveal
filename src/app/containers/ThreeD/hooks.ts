import {
  AssetMapping3D,
  CogniteClient,
  CogniteError,
  Model3D,
  Node3D,
  Revision3D,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import uniqBy from 'lodash/uniqBy';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import keyBy from 'lodash/keyBy';
import {
  FetchQueryOptions,
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from 'react-query';
import { prepareSearchString } from './utils';

export type ThreeDModelsResponse = {
  items: Model3D[];
  nextCursor?: string;
};

type MappingResponse = {
  items: AssetMapping3D[];
  nextCursor?: string;
};
export interface AugmentedMapping extends AssetMapping3D {
  assetName: string;
  assetDescription?: string;
  searchValue: Set<string>;
}
export type AugmentedMappingResponse = {
  items: AugmentedMapping[];
  nextCursor?: string;
};

export const use3DModel = (id: number | undefined) => {
  const sdk = useSDK();

  return useQuery<Model3D>(
    ['cdf', '3d', 'model', id],
    async () => {
      const models = await sdk.get(
        `/api/v1/projects/${sdk.project}/3d/models/${id}`
      );
      return models.data;
    },
    { enabled: Boolean(id) }
  );
};

const getRevisionKey = (id?: number) => ['cdf', '3d', 'model', id, 'revisions'];

type RevisionOpts<T> = UseQueryOptions<Revision3D[], unknown, T>;

export const useRevisions = <T = Revision3D[]>(
  modelId: number,
  opts?: Omit<RevisionOpts<T>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useSDK();
  return useQuery(
    getRevisionKey(modelId),
    () => sdk.revisions3D.list(modelId, { limit: 1000 }).then(r => r.items),
    opts
  );
};

export const useDefault3DModelRevision = (
  modelId: number,
  opts?: Omit<
    RevisionOpts<Revision3D | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useRevisions(modelId!, {
    select: revisions =>
      revisions.find(r => r.published) ||
      revisions.reduce((prev, current) =>
        prev.createdTime > current.createdTime ? prev : current
      ),
    ...opts,
  });
};

export const useRevisionIndex = (
  modelId: number,
  revisionId: number,
  opts?: Omit<
    RevisionOpts<number | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useRevisions(modelId, {
    select: revisions => revisions.findIndex(r => r.id === revisionId),
    ...opts,
  });
};

export const use3DModelThumbnail = (url?: string) => {
  const sdk = useSDK();

  return useQuery<ArrayBuffer>(
    ['cdf', '3d', 'thumbnail', url],
    async () => {
      const resp = await sdk.get(url!, {
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        responseType: 'arraybuffer',
      });
      return resp.data;
    },
    { enabled: Boolean(url) }
  );
};

export const useInfiniteAssetMappings = (
  modelId?: number,
  revisionId?: number,
  limit?: number,
  config?: UseInfiniteQueryOptions<AugmentedMappingResponse, CogniteError>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<AugmentedMappingResponse, CogniteError>(
    ['cdf', 'infinite', '3d', 'asset-mapping', modelId, revisionId],
    async ({ pageParam }) => {
      const models = await getAssetMappingsQueryFn(sdk, modelId, revisionId, {
        limit,
        cursor: pageParam,
      });
      const assetMappings = uniqWith(models.items, isEqual);
      const uniqueAssets = uniqBy(assetMappings, 'assetId');

      // Query assets corresponding to the asset mappings
      const assets =
        uniqueAssets.length > 0
          ? keyBy(
              await sdk.assets.retrieve(
                uniqueAssets.map(({ assetId }) => ({ id: assetId })),
                { ignoreUnknownIds: true }
              ),
              'id'
            )
          : {};

      return {
        nextCursor: models.nextCursor,
        items: models.items.map(mapping => ({
          ...mapping,
          assetName: assets[mapping.assetId].name,
          assetDescription: assets[mapping.assetId].description,
          searchValue: prepareSearchString(
            `${assets[mapping.assetId].name} ${
              assets[mapping.assetId].description || ''
            }`
          ),
        })),
      };
    },
    {
      getNextPageParam: r => r.nextCursor,
      enabled: Boolean(modelId && revisionId),
      ...config,
    }
  );
};

const getAssetMappingsQueryKey = (
  modelId?: number,
  revisionId?: number,
  params?: any
) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
  'asset-mappings',
  params,
];

export const getAssetMappingsQueryFn = async (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number,
  opts?: {
    assetId?: number;
    nodeId?: number;
    limit?: number;
    cursor?: string;
  }
) => {
  if (!modelId || !revisionId) {
    return Promise.reject('modelId or revisionId missing');
  }

  const r = await sdk.get<MappingResponse>(
    `/api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/mappings`,
    { params: opts }
  );
  return r.data;
};

export const fetchAssetMappingsQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  modelId?: number,
  revisionId?: number,
  queryParams?: {
    cursor?: string;
    limit?: number;
    nodeId?: number;
    assetId?: number;
  },
  options?: FetchQueryOptions<MappingResponse>
): Promise<MappingResponse> => {
  return queryClient.fetchQuery(
    getAssetMappingsQueryKey(modelId, revisionId, queryParams),
    () => getAssetMappingsQueryFn(sdk, modelId, revisionId, queryParams),
    options
  );
};

export const useAssetMappings = (
  modelId?: number,
  revisionId?: number,
  limit?: number,
  options?: UseInfiniteQueryOptions<
    MappingResponse,
    CogniteError,
    MappingResponse,
    MappingResponse,
    (string | number | undefined)[]
  >
) => {
  const sdk = useSDK();

  return useInfiniteQuery(
    getAssetMappingsQueryKey(modelId, revisionId),
    ({ pageParam }) =>
      getAssetMappingsQueryFn(sdk, modelId, revisionId, {
        limit,
        cursor: pageParam,
      }),
    {
      ...options,
      enabled: !!modelId && !!revisionId && (options?.enabled ?? true),
      getNextPageParam: lastpage => lastpage.nextCursor,
    }
  );
};

const getAssetMappingsByAssetIdQueryKey = (
  modelId: number,
  revisionId: number,
  assetId: number
) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
  'asset-mapping',
  assetId,
];

const getAncestorsByNodeIdQueryKey = (
  modelId: number,
  revisionId: number,
  nodeId: number
) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
  'ancestors',
  nodeId,
];

export const fetchAssetMappingsByAssetIdQuery = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  modelId: number,
  revisionId: number,
  assetId: number,
  limit: number = 10,
  options?: FetchQueryOptions<MappingResponse>
) => {
  return queryClient.fetchQuery(
    getAssetMappingsByAssetIdQueryKey(modelId, revisionId, assetId),
    () => getAssetMappingsQueryFn(sdk, modelId, revisionId, { assetId, limit }),
    options
  );
};

export const fetchAncestorsByNodeIdQuery = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  modelId: number,
  revisionId: number,
  nodeId: number,
  limit: number = 1000,
  options?: FetchQueryOptions<Node3D[]>
): Promise<Node3D[]> => {
  return queryClient.fetchQuery(
    getAncestorsByNodeIdQueryKey(modelId, revisionId, nodeId),
    () =>
      sdk.revisions3D
        .list3DNodeAncestors(modelId, revisionId, nodeId)
        .autoPagingToArray({ limit }),
    options
  );
};

const getClosestAssetIdQueryKey = (
  modelId: number,
  revisionId: number,
  nodeId: number
) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
  'nodeId',
  nodeId,
  'closest-asset',
];

export const fetchClosestAssetIdQuery = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  modelId: number,
  revisionId: number,
  nodeId: number,
  limit: number = 1000,
  options?: FetchQueryOptions<number | undefined>
): Promise<number | undefined> => {
  return queryClient.fetchQuery(
    getClosestAssetIdQueryKey(modelId, revisionId, nodeId),
    async () => {
      const ancestors = await fetchAncestorsByNodeIdQuery(
        sdk,
        queryClient,
        modelId,
        revisionId,
        nodeId,
        limit
      );

      const nodeIds = ancestors
        .filter(node => node.depth !== 0)
        .map(node => node.id)
        .reverse();

      for (let nodeId of nodeIds) {
        const { assetId } = (await fetchAssetMappingsQuery(
          sdk,
          queryClient,
          modelId,
          revisionId,
          {
            nodeId,
            // TODO: figure out what happens when a node maps to multiple assets
            limit: 1,
          }
        ).then(r => r.items[0])) || { assetId: undefined };
        if (assetId) {
          return assetId;
        }
      }
    },
    options
  );
};
