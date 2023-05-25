import {
  Asset,
  AssetMapping3D,
  CogniteClient,
  CogniteError,
  Model3D,
  Node3D,
  AnnotationFilterProps,
  AnnotationsBoundingVolume,
  AnnotationFilterRequest,
  CogniteInternalId,
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
} from '@tanstack/react-query';
import {
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  Image360Collection,
} from '@cognite/reveal';
import { Vector3 } from 'three';
import _ from 'lodash';
import {
  Revision3DWithIndex,
  use3DRevisionsQuery,
  useEventsSearchResultQuery,
} from '@data-exploration-lib/domain-layer';
import { IMAGE_360_POSITION_THRESHOLD, prepareSearchString } from './utils';

export type ThreeDModelsResponse = {
  items: Model3D[];
  nextCursor?: string;
};

type MappingResponse = {
  items: AssetMapping3D[];
  nextCursor?: string;
};
export interface AugmentedMapping extends Partial<AssetMapping3D> {
  assetName: string;
  assetDescription?: string;
  searchValue: Set<string>;
  annotationId?: number;
}
export type AugmentedMappingResponse = {
  items: AugmentedMapping[];
  nextCursor?: string;
};

export type Image360SiteData = {
  siteId: string;
  siteName: string;
};

export const use3DModel = (id: number | undefined) => {
  const sdk = useSDK();

  return useQuery<Model3D | undefined>(
    ['cdf', '3d', 'model', id],
    async () => {
      if (id) {
        const models = await sdk.models3D.retrieve(id);

        return models;
      }
      return;
    },
    { enabled: Boolean(id) }
  );
};

type RevisionOpts<T> = UseQueryOptions<Revision3DWithIndex[], unknown, T>;

export const useRevision = (
  modelId?: number,
  revisionId?: number,
  opts?: Omit<
    RevisionOpts<Revision3DWithIndex | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return use3DRevisionsQuery(modelId, {
    select: (revisions = []) => revisions.find((r) => r.id === revisionId),
    ...opts,
  });
};

export const useRevisionIndex = (
  modelId?: number,
  revisionId?: number,
  opts?: Omit<
    RevisionOpts<number | undefined>,
    'queryKey' | 'queryFn' | 'select'
  >
) => {
  return use3DRevisionsQuery(modelId, {
    select: (revisions = []) => {
      const index = [...revisions]
        .reverse()
        .findIndex((r) => r.id === revisionId);
      return index >= 0 ? index + 1 : index;
    },
    ...opts,
  });
};

export const useImage360 = (siteId?: string): Image360SiteData | undefined => {
  const { data: images360Data } = useEventsSearchResultQuery({
    eventsFilters: {
      type: 'scan',
      metadata: [
        {
          key: 'site_id',
          value: siteId ?? '',
        },
      ],
    },
  });

  if (!siteId || images360Data.length === 0) return;

  const img360 = images360Data[0];
  const image360SiteData: Image360SiteData = {
    siteId,
    siteName: img360.metadata?.site_name ?? 'No site name',
  };
  return image360SiteData;
};

export const useInfiniteAssetMappings = (
  modelId?: number,
  revisionId?: number,
  limit?: number,
  isPointCloud?: boolean,
  config?: UseInfiniteQueryOptions<AugmentedMappingResponse, CogniteError>
) => {
  const sdk = useSDK();
  return useInfiniteQuery<AugmentedMappingResponse, CogniteError>(
    ['cdf', 'infinite', '3d', 'asset-mapping', modelId, revisionId],
    async ({ pageParam }) => {
      let mappings:
        | Partial<AssetMapping3D>
        | { assetId: CogniteInternalId; annotationId?: number }[];
      let nextCursor: string | undefined;
      if (modelId !== undefined && isPointCloud) {
        const filter: AnnotationFilterProps = {
          annotatedResourceType: 'threedmodel',
          annotatedResourceIds: [{ id: modelId }],
          annotationType: 'pointcloud.BoundingVolume',
        };
        const annotationFilter: AnnotationFilterRequest = {
          filter: filter,
        };
        const annotations = await getAnnotationsQueryFn(sdk, {
          cursor: pageParam,
          limit: limit,
          filter: annotationFilter,
        });

        mappings = annotations.items.map((annotation) => ({
          annotationId: annotation.id,
          assetId: (annotation.data as AnnotationsBoundingVolume).assetRef
            ?.id as number,
        }));
        nextCursor = annotations.nextCursor;
      } else {
        const models = await getAssetMappingsQueryFn(sdk, modelId, revisionId, {
          limit,
          cursor: pageParam,
        });
        mappings = models.items;
        nextCursor = models.nextCursor;
      }
      const uniqueAssets = uniqBy(mappings, 'assetId');
      const assets =
        uniqueAssets.length > 0
          ? keyBy(
              await sdk.assets.retrieve(
                uniqueAssets.map(({ assetId }) => ({
                  id: assetId,
                })),
                { ignoreUnknownIds: true }
              ),
              'id'
            )
          : {};
      return {
        nextCursor: nextCursor,
        items: mappings
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

export const getAnnotationsQueryFn = async (
  sdk: CogniteClient,
  opts: {
    cursor?: string;
    limit?: number;
    filter: AnnotationFilterRequest;
  }
) => {
  const { nextCursor, items } = await sdk.annotations.list({
    limit: opts.limit,
    cursor: opts.cursor,
    filter: opts.filter.filter,
  });

  return {
    nextCursor,
    items,
  };
};

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
    loadedSecondaryModels?: (CogniteCadModel | CognitePointCloudModel)[],
    setLoadedSecondaryModels?: (
      models: (CogniteCadModel | CognitePointCloudModel)[]
    ) => void,
    applied?: boolean
  ) =>
  async () => {
    if (
      applied === undefined ||
      setLoadedSecondaryModels === undefined ||
      loadedSecondaryModels === undefined
    ) {
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
      try {
        await viewer.addModel({ modelId, revisionId });
        setLoadedSecondaryModels(viewer.models.slice(1));
      } catch {
        return Promise.reject({
          message:
            'The selected 3D model is not supported and can not be loaded. If the 3D model is very old, try uploading a new revision under Upload 3D models in Fusion.',
        });
      }
    } else if (!applied && hasAdded) {
      const modelToRemove = (
        viewer.models as (CogniteCadModel | CognitePointCloudModel)[]
      ).find(
        ({ modelId: tmId, revisionId: trId }) =>
          modelId === tmId && revisionId === trId
      );
      if (modelToRemove) {
        loadedSecondaryModels.splice(
          loadedSecondaryModels.findIndex(
            (modelToRemoveFromSecondaryModel) =>
              modelToRemoveFromSecondaryModel.modelId === modelToRemove.modelId
          ),
          1
        );
        setLoadedSecondaryModels(loadedSecondaryModels);
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
    imageEntities?: { siteId: string; images: Image360Collection }[],
    setImageEntities?: (
      entities: { siteId: string; images: Image360Collection }[]
    ) => void,
    is360ImagesMode?: boolean,
    setIs360ImagesMode?: (mode: boolean) => void,
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
      let images360Set;
      try {
        // By default rotation are not premultiplied with models
        images360Set = await viewer.add360ImageSet(
          'events',
          { site_id: siteId },
          { collectionTransform, preMultipliedRotation: false }
        );
      } catch {
        return Promise.reject({
          message: 'The selected 360 image set is not supported',
        });
      }

      const cameraPosition = viewer.cameraManager.getCameraState().position;
      const reusableVec = new Vector3();

      const currentImage360 = images360Set.image360Entities.find(
        ({ transform }) =>
          cameraPosition.distanceToSquared(
            reusableVec.setFromMatrixPosition(transform)
          ) < IMAGE_360_POSITION_THRESHOLD
      );

      if (currentImage360) {
        viewer.enter360Image(currentImage360);
      }

      setImageEntities(
        imageEntities.concat({
          siteId: siteId,
          images: images360Set,
        })
      );
      images360Set.on('image360Entered', () => {
        setIs360ImagesMode?.(true);
      });
      images360Set.on('image360Exited', () => {
        setIs360ImagesMode?.(false);
      });
    } else if (!applied && hasAdded) {
      const images360ToRemove = imageEntities.find(
        ({ siteId: tmId }) => siteId === tmId
      );
      if (images360ToRemove) {
        images360ToRemove.images.off('image360Entered', _.noop);
        images360ToRemove.images.off('image360Exited', _.noop);
        await viewer.remove360Images(
          ...images360ToRemove.images.image360Entities
        );
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
