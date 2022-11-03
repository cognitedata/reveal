import {
  Asset,
  AssetMapping3D,
  CogniteClient,
  CogniteError,
  Model3D,
  Node3D,
  Revision3D,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import uniqBy from 'lodash/uniqBy';
import {
  FetchQueryOptions,
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';

export type ThreeDModelsResponse = {
  items: Model3D[];
  nextCursor?: string;
};

export type AssetMappingResponse = {
  items: Asset[];
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
  config?: UseInfiniteQueryOptions<AssetMappingResponse>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<AssetMappingResponse>(
    ['cdf', 'infinite', '3d', 'asset-mapping', modelId, revisionId],
    async ({ pageParam }) => {
      // Query asset mappings in the 3D model
      const models = await sdk.get(
        `/api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/mappings`,
        { params: { limit: limit || 1000, cursor: pageParam } }
      );
      const assetMappings = models.data.items as AssetMapping3D[];
      const uniqueAssetMappings = uniqBy(assetMappings, 'assetId');

      // Query assets corresponding to the asset mappings
      const assets = await sdk.assets.retrieve(
        uniqueAssetMappings.map(({ assetId }) => ({ id: assetId })),
        { ignoreUnknownIds: true }
      );

      return { nextCursor: models.data.nextCursor, items: assets };
    },
    {
      getNextPageParam: r => r.nextCursor,
      enabled: Boolean(modelId && revisionId),
      ...config,
    }
  );
};

const getAssetMappingsQueryKey = (modelId?: number, revisionId?: number) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
  'asset-mappings',
];

export const getAssetMappingsQueryFn = (
  sdk: CogniteClient,
  modelId?: number,
  revisionId?: number,
  opts?: {
    assetId?: number;
    limit?: number;
  }
) => {
  if (!modelId || !revisionId) {
    return [] as AssetMapping3D[];
  }
  const request = opts?.assetId
    ? sdk.assetMappings3D.list(modelId!, revisionId, { assetId: opts?.assetId })
    : sdk.assetMappings3D.list(modelId!, revisionId);

  return request
    .autoPagingToArray({ limit: opts?.limit || -1 })
    .then(mappings => uniqWith(mappings, isEqual));
};

export const fetchAssetMappingsQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  modelId?: number,
  revisionId?: number,
  limit: number = -1,
  options?: FetchQueryOptions<AssetMapping3D[]>
): Promise<AssetMapping3D[]> => {
  return queryClient.fetchQuery(
    getAssetMappingsQueryKey(modelId, revisionId),
    () => getAssetMappingsQueryFn(sdk, modelId, revisionId, { limit }),
    options
  );
};

export const useAssetMappings = (
  modelId?: number,
  revisionId?: number,
  limit?: number,
  options?: UseQueryOptions<
    AssetMapping3D[],
    CogniteError,
    AssetMapping3D[],
    (string | number | undefined)[]
  >
) => {
  const sdk = useSDK();

  return useQuery(
    getAssetMappingsQueryKey(modelId, revisionId),
    () => getAssetMappingsQueryFn(sdk, modelId, revisionId, { limit }),
    {
      ...options,
      enabled: !!modelId && !!revisionId && (options?.enabled ?? true),
    }
  );
};

const getMappedAssetsQueryKey = (modelId: number, revisionId: number) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
  'mapped-assets',
];

export const useMappedAssets = (
  modelId?: number,
  revisionId?: number,
  limit: number = -1,
  options?: UseQueryOptions<Asset[], CogniteError, Asset[], (string | number)[]>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useQuery(
    getMappedAssetsQueryKey(modelId!, revisionId!),
    async () => {
      const mappings = await fetchAssetMappingsQuery(
        sdk,
        queryClient,
        modelId,
        revisionId,
        limit
      );

      return mappings?.length
        ? sdk.assets
            .retrieve(mappings?.map(({ assetId }) => ({ id: assetId })))
            .then(stuff => stuff.sort((a, b) => a.name.localeCompare(b.name)))
        : [];
    },
    {
      ...options,
      enabled: !!modelId && !!revisionId && (options?.enabled ?? true),
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
  limit: number = -1,
  options?: FetchQueryOptions<AssetMapping3D[]>
): Promise<AssetMapping3D[]> => {
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
  limit: number = -1,
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
  limit: number = -1,
  options?: FetchQueryOptions<number | undefined>
): Promise<number | undefined> => {
  return queryClient.fetchQuery(
    getClosestAssetIdQueryKey(modelId, revisionId, nodeId),
    async () => {
      const [ancestors, mappings] = await Promise.all([
        fetchAncestorsByNodeIdQuery(
          sdk,
          queryClient,
          modelId,
          revisionId,
          nodeId,
          limit
        ),
        fetchAssetMappingsQuery(sdk, queryClient, modelId, revisionId, limit),
      ]);

      const assetNodeIds = ancestors
        .filter(node => node.depth !== 0)
        .map(node => node.id)
        .reverse();

      let closestAssetId: number | undefined;
      for (const assetNodeId of assetNodeIds) {
        const mapping = mappings.find(
          ({ nodeId: mappingNodeId }) => mappingNodeId === assetNodeId
        );

        if (mapping) {
          closestAssetId = mapping.assetId;
          break;
        }
      }

      return closestAssetId;
    },
    options
  );
};
