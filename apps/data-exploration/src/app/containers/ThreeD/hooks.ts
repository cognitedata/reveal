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
import {
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  Image360,
} from '@cognite/reveal';

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

export type Revision3DWithIndex = Revision3D & { index: number };

type RevisionOpts<T> = UseQueryOptions<Revision3DWithIndex[], unknown, T>;

export const useRevisions = <T = Revision3DWithIndex[]>(
  modelId: number,
  opts?: Omit<RevisionOpts<T>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useSDK();
  return useQuery(
    getRevisionKey(modelId),
    () =>
      sdk.revisions3D
        .list(modelId)
        .autoPagingToArray({ limit: -1 })
        .then((res) =>
          res.map((r, rIndex) => ({ ...r, index: res.length - rIndex }))
        ),
    opts
  );
};

export const useDefault3DModelRevision = (
  modelId: number,
  opts?: Omit<
    RevisionOpts<Revision3DWithIndex | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useRevisions(modelId!, {
    select: (revisions = []) =>
      revisions.find((r) => r.published) ||
      revisions.reduce((prev, current) =>
        prev.createdTime > current.createdTime ? prev : current
      ),
    ...opts,
  });
};

export const useRevision = (
  modelId: number,
  revisionId: number,
  opts?: Omit<
    RevisionOpts<Revision3DWithIndex | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return useRevisions(modelId!, {
    select: (revisions = []) => revisions.find((r) => r.id === revisionId),
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
    select: (revisions = []) => {
      const index = [...revisions]
        .reverse()
        .findIndex((r) => r.id === revisionId);
      return index >= 0 ? index + 1 : index;
    },
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
      const uniqueAssets = uniqBy(models.items, 'assetId');

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
        items: models.items
          .filter(({ assetId }) => !!assets[assetId])
          .map((mapping) => ({
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
      getNextPageParam: (r) => r.nextCursor,
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

  const { nextCursor, items } = (
    await sdk.get<MappingResponse>(
      `/api/v1/projects/${sdk.project}/3d/models/${modelId}/revisions/${revisionId}/mappings`,
      { params: opts }
    )
  ).data;
  return {
    nextCursor,
    items: items.filter((i) => !!i.treeIndex),
  };
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
  limit = 10,
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
  limit = 1000,
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
  limit = 1000,
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
        .filter((node) => node.depth !== 0)
        .map((node) => node.id)
        .reverse();

      for (const nodeId of nodeIds) {
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
        ).then((r) => r.items[0])) || { assetId: undefined };
        if (assetId) {
          return assetId;
        }
      }

      return undefined;
    },
    options
  );
};

const getAssetDetailsQueryKey = (assetId: number) => [
  'sdk-react-query-hooks',
  'cdf',
  'assets',
  'get',
  'byId',
  { id: assetId },
];

export const fetchAssetDetails = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  assetId: number,
  options?: FetchQueryOptions<Asset | undefined>
) => {
  return queryClient.fetchQuery(
    getAssetDetailsQueryKey(assetId),
    async () =>
      sdk.assets.retrieve([{ id: assetId }]).then((items) => items[0]),
    options
  );
};

export const SECONDARY_MODEL_BASE_QUERY_KEY = 'reveal-secondary-model';
export const IMAGES_360_BASE_QUERY_KEY = 'reveal-360-images';

export const getSecondaryModelQueryKey = (
  modelId: number,
  revisionId: number
) => [SECONDARY_MODEL_BASE_QUERY_KEY, modelId, revisionId];

export const getSecondaryModelAppliedStateQueryKey = (
  modelId: number,
  revisionId: number,
  applied?: boolean
) => [...getSecondaryModelQueryKey(modelId, revisionId), applied];

export const getSecondaryModelQueryFn =
  (
    queryClient: QueryClient,
    viewer: Cognite3DViewer,
    modelId: number,
    revisionId: number,
    applied?: boolean
  ) =>
  async () => {
    if (applied === undefined) {
      return undefined;
    }

    queryClient.invalidateQueries(
      getSecondaryModelAppliedStateQueryKey(modelId, revisionId, !applied)
    );

    const hasAdded = (
      viewer.models as (CogniteCadModel | CognitePointCloudModel)[]
    ).some(
      ({ modelId: tmId, revisionId: trId }) =>
        modelId === tmId && revisionId === trId
    );

    if (applied && !hasAdded) {
      await viewer.addModel({ modelId, revisionId });
    } else if (!applied && hasAdded) {
      const modelToRemove = (
        viewer.models as (CogniteCadModel | CognitePointCloudModel)[]
      ).find(
        ({ modelId: tmId, revisionId: trId }) =>
          modelId === tmId && revisionId === trId
      );
      if (modelToRemove) {
        viewer.removeModel(modelToRemove);
      }
    }

    return applied;
  };

export const getImages360QueryKey = (siteId: string) => [
  IMAGES_360_BASE_QUERY_KEY,
  siteId,
];

export const getImages360AppliedStateQueryKey = (
  siteId: string,
  applied?: boolean,
  rotationMatrix?: THREE.Matrix4,
  translationMatrix?: THREE.Matrix4
) => [
  ...getImages360QueryKey(siteId),
  applied,
  rotationMatrix,
  translationMatrix,
];

export const getImages360QueryFn =
  (
    queryClient: QueryClient,
    viewer: Cognite3DViewer,
    siteId: string,
    applied?: boolean,
    imageEntities?: { siteId: string; images: Image360[] }[],
    setImageEntities?: (
      entities: { siteId: string; images: Image360[] }[]
    ) => void,
    rotationMatrix?: THREE.Matrix4,
    translationMatrix?: THREE.Matrix4
  ) =>
  async () => {
    if (
      applied === undefined ||
      imageEntities === undefined ||
      setImageEntities === undefined
    ) {
      return undefined;
    }

    queryClient.invalidateQueries(
      getImages360AppliedStateQueryKey(
        siteId,
        !applied,
        rotationMatrix,
        translationMatrix
      )
    );

    const hasAdded = imageEntities.some(({ siteId: tmId }) => siteId === tmId);

    if (applied && !hasAdded) {
      const collectionTransform = translationMatrix?.multiply(rotationMatrix!);
      const images360Set = await viewer.add360ImageSet(
        'events',
        { site_id: siteId },
        { collectionTransform, preMultipliedRotation: true }
      );
      setImageEntities(
        imageEntities.concat({
          siteId: siteId,
          images: images360Set.image360Entities,
        })
      );
    } else if (!applied && hasAdded) {
      const images360ToRemove = imageEntities.find(
        ({ siteId: tmId }) => siteId === tmId
      );
      if (images360ToRemove) {
        await viewer.remove360Images(...images360ToRemove.images);
        imageEntities.splice(
          imageEntities.findIndex(
            (images360ToRemove) => images360ToRemove.siteId === siteId
          ),
          1
        );
        setImageEntities(imageEntities);
      }
    }

    return applied;
  };
