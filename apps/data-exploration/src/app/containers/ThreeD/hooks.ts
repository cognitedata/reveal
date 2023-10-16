import {
  FetchQueryOptions,
  QueryClient,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import _ from 'lodash';
import keyBy from 'lodash/keyBy';
import uniqBy from 'lodash/uniqBy';
import THREE, { Vector3, Color } from 'three';

import { getProject } from '@cognite/cdf-utilities';
import {
  CogniteModel,
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  Image360Collection,
  Overlay3DTool,
  OverlayInfo,
  Image360,
} from '@cognite/reveal';
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
  InternalId,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import {
  Image360SiteData,
  Revision3DWithIndex,
  use3DRevisionsQuery,
  useEventsSearchResultQuery,
} from '@data-exploration-lib/domain-layer';

import {
  PointsOfInterestOverlayCollection,
  PointsOfInterestOverlayCollectionType,
} from './load-secondary-models/PointsOfInterestLoader';
import {
  IMAGE_360_POSITION_THRESHOLD,
  SECONDARY_MODEL_DISPLAY_LIMIT,
  prepareSearchString,
} from './utils';

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

type ListFDMDataModelsResponse = {
  items: FDMDataModelResponseItem[];
};

type FDMDataModelResponseItem = {
  space: string;
  externalId: string;
  version: string;
  name: string;
};

type APMConfigResponse = {
  data: {
    listAPM_Config: {
      edges: APMConfigEdge[];
    };
  };
};

type APMConfigEdge = {
  node: APMConfigNode;
};

export type APMConfigNode = {
  name: string | null;
  appDataSpaceId: string;
  appDataSpaceVersion: string;
  customerDataSpaceId: string;
  customerDataSpaceVersion: string;
};

export type FDMChecklistResponse = {
  data: {
    listAPM_Checklist: {
      items: FDMChecklistItemResponse[];
      pageInfo: PageInfo;
    };
  };
};

export type FDMChecklistItemResponse = {
  description: string;
  title: string;
  status: string;
  externalId: string;
  items: {
    items: {
      title: string;
      observations: {
        items: {
          description: string;
          fileIds: string[];
          position: {
            x: number;
            y: number;
            z: number;
          };
        }[];
      };
    }[];
  };
};

export type PageInfo = {
  startCursor: string;
  endCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PointsOfInterestCollection = {
  externalId: string;
  title?: string;
  description?: string;
  status?: string;
  pointsOfInterest?: PointOfInterest[];
  applied?: boolean;
};

export type PointOfInterest = {
  title: string; // Comes from the ChecklistItem
  description: string;
  fileIds: string[];
  position: ThreeDPosition;
};

export type ThreeDPosition = {
  x: number;
  y: number;
  z: number;
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
    lastUpdatedTime: new Date(img360.lastUpdatedTime),
    siteName: img360.metadata?.site_name ?? 'No site name',
  };
  return image360SiteData;
};

export const useAPMConfig = () => {
  const sdk = useSDK();
  const project = getProject();
  const baseUrl = sdk.getBaseUrl();

  return useQuery<APMConfigNode>(
    ['cdf', '3d', 'FDM', 'APMConfig', project],
    async () => {
      // Find correct version and space for the APM_Config
      const listDataModelsUrl = `${baseUrl}/api/v1/projects/${project}/models/datamodels`;
      const listDataModelsResponse = await sdk.get(listDataModelsUrl);
      const dataModelsList =
        listDataModelsResponse.data as ListFDMDataModelsResponse;

      const filteredDataModelsList = dataModelsList.items.filter(
        (item) => item.name === 'APM_Config'
      );

      const getApmConfigQuery = {
        data: {
          query: `query MyQuery {
          listAPM_Config {
            edges {
              node {
                name
                appDataSpaceId
                appDataSpaceVersion
                customerDataSpaceId
                customerDataSpaceVersion
                featureConfiguration
                fieldConfiguration
                rootLocationsConfiguration
              }
            }
          }
        }`,
        },
      };

      if (filteredDataModelsList.length === 0)
        throw new Error('No APM data model found');

      const space = filteredDataModelsList[0].space;
      const version = filteredDataModelsList[0].version;
      const fdmGetAPMConfigEndpoint = `${baseUrl}/api/v1/projects/${project}/userapis/spaces/${space}/datamodels/${space}/versions/${version}/graphql`;

      const fdmAPMConfigData = await sdk.post(
        fdmGetAPMConfigEndpoint,
        getApmConfigQuery
      );

      const fdmConfigDataResponseAsList =
        fdmAPMConfigData.data as APMConfigResponse;

      if (fdmConfigDataResponseAsList.data.listAPM_Config.edges.length === 0) {
        throw new Error('No correct APM data model found');
      }

      return fdmConfigDataResponseAsList.data.listAPM_Config.edges[0].node;
    },
    { refetchOnWindowFocus: false }
  );
};

export const useInfiniteChecklistItems = (
  configProp?: UseInfiniteQueryOptions<FDMChecklistResponse, CogniteError>
) => {
  const sdk = useSDK();

  const { data: apmConfig } = useAPMConfig();

  return useInfiniteQuery<FDMChecklistResponse, CogniteError>(
    ['cdf', 'infinite', '3d', '3d-points-of-interest'],
    async ({ pageParam }) => {
      const emptyResponse: FDMChecklistResponse = {
        data: {
          listAPM_Checklist: {
            items: [],
            pageInfo: {
              startCursor: '',
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
        },
      };

      const project = getProject();
      const baseUrl = sdk.getBaseUrl();

      if (!apmConfig) {
        return emptyResponse;
      }
      // Get checklist data
      const fdmGetChecklistItemsQueryEndpoint = `${baseUrl}/api/v1/projects/${project}/userapis/spaces/${apmConfig.appDataSpaceId}/datamodels/${apmConfig.appDataSpaceId}/versions/${apmConfig.appDataSpaceVersion}/graphql`;

      const numberOfElementsFilter = `first: 10`;

      let cursor = '';
      if (pageParam !== null && pageParam !== undefined) {
        cursor = ` after: "${pageParam}"`;
      }
      const getChecklistItemsQuery = {
        data: {
          query: `query GetChecklistItems {
            listAPM_Checklist (${numberOfElementsFilter} ${cursor}) {
              items {
                description
                title
                status
                externalId
                items(first: 500) {
                  items {
                    title
                    observations(first: 500) {
                      items {
                        description
                        fileIds
                        position {
                          x
                          y
                          z
                        }
                      }
                    }
                  }
                }
              },
              pageInfo {
                startCursor
                endCursor
                hasNextPage
                hasPreviousPage
              }
            }
          }`,
        },
      };
      const fdmFilteredChecklistData = await sdk.post(
        fdmGetChecklistItemsQueryEndpoint,
        getChecklistItemsQuery
      );

      // If the number of items asked for is a multiple of the limit, and the last item is fetched
      // FDM will return hasNextPage as true, even though there is no more data to fetch
      // Must thus check if it has returned a FDMChecklistResponse
      const fdmChecklistResponse =
        fdmFilteredChecklistData.data as FDMChecklistResponse;

      function isFdmChecklistResponse(
        response: FDMChecklistResponse
      ): response is FDMChecklistResponse {
        return (
          response.data !== undefined &&
          response.data.listAPM_Checklist !== undefined &&
          response.data.listAPM_Checklist.items !== undefined
        );
      }

      if (isFdmChecklistResponse(fdmChecklistResponse)) {
        return fdmChecklistResponse;
      } else {
        return emptyResponse;
      }
    },
    {
      getNextPageParam: (prevPage) => {
        if (prevPage === undefined || prevPage.data === undefined) {
          return undefined;
        }
        return prevPage.data.listAPM_Checklist.pageInfo.hasNextPage
          ? prevPage.data.listAPM_Checklist.pageInfo.endCursor
          : undefined;
      },
      ...configProp,
      enabled: !!apmConfig,
    }
  );
};

export const useInfiniteAssetMappings = (
  modelId?: number,
  revisionId?: number,
  model?: CogniteModel | Image360Collection,
  config?: UseInfiniteQueryOptions<AugmentedMappingResponse, CogniteError>
) => {
  const limit = 1000;

  const sdk = useSDK();

  return useInfiniteQuery<AugmentedMappingResponse, CogniteError>(
    [
      'cdf',
      'infinite',
      '3d',
      'asset-mapping',
      modelId ?? (model as Image360Collection | undefined)?.id,
      revisionId ?? 1,
    ],
    async ({ pageParam }) => {
      let mappings:
        | Partial<AssetMapping3D>
        | { assetId: CogniteInternalId; annotationId?: number }[];
      let nextCursor: string | undefined;
      if (modelId !== undefined && model instanceof CognitePointCloudModel) {
        const filter: AnnotationFilterProps = {
          annotatedResourceType: 'threedmodel',
          annotatedResourceIds: [{ id: modelId }],
          annotationType: 'pointcloud.BoundingVolume',
        };
        const annotationFilter: AnnotationFilterRequest = {
          filter,
        };
        const annotations = await getAnnotationsQueryFn(sdk, {
          cursor: pageParam,
          limit,
          filter: annotationFilter,
        });

        mappings = annotations.items.map((annotation) => ({
          annotationId: annotation.id,
          assetId: (annotation.data as AnnotationsBoundingVolume).assetRef
            ?.id as number,
        }));
        nextCursor = annotations.nextCursor;
      } else if (modelId !== undefined && revisionId !== undefined) {
        const models = await getAssetMappingsQueryFn(sdk, modelId, revisionId, {
          limit,
          cursor: pageParam,
        });
        mappings = models.items;
        nextCursor = models.nextCursor;
      } else {
        const image360 = model as Image360Collection;
        const assets = await image360.getAssetIds();
        mappings = assets
          .filter((a) => (a as InternalId).id !== undefined)
          .map((a) => ({
            assetId: (a as InternalId).id!,
          }));
      }

      const uniqueAssets = uniqBy(mappings, 'assetId');

      let assets = {} as Record<number, Asset>;
      if (uniqueAssets.length > 0) {
        const retrievedAssets = await sdk.assets.retrieve(
          uniqueAssets.map(({ assetId }) => ({
            id: assetId,
          })),
          { ignoreUnknownIds: true }
        );
        assets = keyBy(retrievedAssets, 'id');
      }

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
      enabled: Boolean(!!model),
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
      `/api/v1/projects/${getProject()}/3d/models/${modelId}/revisions/${revisionId}/mappings`,
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
export const POINTS_OF_INTEREST_BASE_QUERY_KEY = 'reveal-pois';

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
            'The selected 3D model is not supported and can not be loaded. If the 3D model is very old, try uploading a new revision under Manage 3D data in Fusion.',
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
    setImage360Entity?: (entity: Image360 | undefined) => void,
    setEnteredImage360Collection?: (
      collection: Image360Collection | undefined
    ) => void,
    rotationMatrix?: THREE.Matrix4,
    translationMatrix?: THREE.Matrix4
  ) =>
  async () => {
    if (applied === undefined) {
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

    const imageEntities = viewer.get360ImageCollections();

    const hasAdded = imageEntities.some(({ id: tmId }) => siteId === tmId);
    if (applied && !hasAdded) {
      const collectionTransform = translationMatrix?.multiply(rotationMatrix!);
      let images360Set: Image360Collection;
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

      images360Set.on('image360Entered', (image360) => {
        setImage360Entity?.(image360);
        setEnteredImage360Collection?.(images360Set);
      });
      images360Set.on('image360Exited', () => {
        setImage360Entity?.(undefined);
        setEnteredImage360Collection?.(undefined);
      });
    } else if (!applied && hasAdded) {
      const images360ToRemove = imageEntities.find(
        ({ id: tmId }) => siteId === tmId
      );
      if (images360ToRemove) {
        await viewer.remove360Images(...images360ToRemove.image360Entities);
      }
    }
    return applied;
  };

export const getPointsOfInterestQueryKey = (externalId: string) => [
  POINTS_OF_INTEREST_BASE_QUERY_KEY,
  externalId,
];

export const getPointsOfInterestsAppliedStateQueryKey = (
  externalId: string,
  applied?: boolean
) => [...getPointsOfInterestQueryKey(externalId), applied];

export const getPointsOfInterestsQueryFn = (
  queryClient: QueryClient,
  pointsOfInterestCollection: PointsOfInterestCollection,
  pointsOfInterestOverlayCollection: PointsOfInterestOverlayCollection[],
  overlayTool?: Overlay3DTool<PointsOfInterestOverlayCollectionType>
) => {
  return () => {
    queryClient.invalidateQueries(
      getPointsOfInterestsAppliedStateQueryKey(
        pointsOfInterestCollection.externalId,
        !pointsOfInterestCollection.applied
      )
    );

    if (!overlayTool) return;

    const shouldAddPointsOfInterest = pointsOfInterestCollection.applied;
    const hasAdded = pointsOfInterestOverlayCollection.some(
      ({ externalId: tmId }) => pointsOfInterestCollection.externalId === tmId
    );

    if (shouldAddPointsOfInterest && !hasAdded) {
      const labels:
        | OverlayInfo<PointsOfInterestOverlayCollectionType>[]
        | undefined = pointsOfInterestCollection.pointsOfInterest?.map(
        (poi, index) => {
          const position = new Vector3(
            poi.position.x,
            poi.position.y,
            poi.position.z
          );
          return {
            position,
            content: {
              poiCollectionExternalId: pointsOfInterestCollection.externalId,
              poiIndex: index,
            },
          };
        }
      );
      const collection = overlayTool.createOverlayCollection(labels, {
        defaultOverlayColor: new Color('#4A67FB'),
      });
      pointsOfInterestOverlayCollection.push({
        externalId: pointsOfInterestCollection.externalId,
        overlays: collection,
      });
    } else if (!shouldAddPointsOfInterest && hasAdded) {
      const collectionToRemove = pointsOfInterestOverlayCollection.find(
        (collection) =>
          collection.externalId === pointsOfInterestCollection.externalId
      );

      if (
        collectionToRemove !== null &&
        collectionToRemove !== undefined &&
        collectionToRemove.overlays
      ) {
        overlayTool.removeOverlayCollection(collectionToRemove.overlays);
        pointsOfInterestOverlayCollection.splice(
          pointsOfInterestOverlayCollection.indexOf(collectionToRemove),
          1
        );
      }
    }
    return true;
  };
};
