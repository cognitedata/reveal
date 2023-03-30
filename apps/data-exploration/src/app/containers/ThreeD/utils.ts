import sdk from '@cognite/cdf-sdk-singleton';
import * as THREE from 'three';
import {
  AssetNodeCollection,
  InvertedNodeCollection,
  CadIntersection,
  CogniteCadModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
  ViewerState,
  PointCloudIntersection,
  CognitePointCloudModel,
} from '@cognite/reveal';
import {
  CogniteClient,
  BoundingBox3D,
  CogniteInternalId,
  Node3D,
  Model3D,
} from '@cognite/sdk';
import {
  fetchAssetDetails,
  fetchAssetMappingsByAssetIdQuery,
  fetchClosestAssetIdQuery,
  Image360SiteData,
  Revision3DWithIndex,
} from '@data-exploration-app/containers/ThreeD/hooks';
import {
  Image360DatasetOptions,
  SecondaryModelOptions,
  SlicingState,
} from '@data-exploration-app/containers/ThreeD/ThreeDContext';

import { FetchQueryOptions, QueryClient } from 'react-query';

export const THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY = 'viewerState';
export const THREE_D_SLICING_STATE_QUERY_PARAMETER_KEY = 'slicingState';
export const THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY = 'selectedAssetId';
export const THREE_D_ASSET_DETAILS_EXPANDED_QUERY_PARAMETER_KEY = 'expanded';
export const THREE_D_ASSET_HIGHLIGHT_MODE_PARAMETER_KEY = 'hl_mode';
export const THREE_D_SECONDARY_MODELS_QUERY_PARAMETER_KEY = 'secondaryModels';
export const THREE_D_REVISION_ID_QUERY_PARAMETER_KEY = 'revisionId';
export const THREE_D_CUBEMAP_360_IMAGES_QUERY_PARAMETER_KEY = 'images360';

export const MINIMUM_BOUNDINGBOX_SIZE = 0.001;
export const CAMERA_ANIMATION_DURATION = 500;
export const IMAGE_360_POSITION_THRESHOLD = 0.0001;

export const SECONDARY_MODEL_DISPLAY_LIMIT = 20;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const getAssetQueryKey = (assetId: number) => [
  'cdf',
  '3d',
  'assetId',
  assetId,
];

const queryKeyBase = (modelId: number, revisionId: number) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
];

const getAssetNodeCollectionQueryKey = (
  modelId: number,
  revisionId: number,
  assetId?: number
) => [
  ...queryKeyBase(modelId, revisionId),
  'node-asset-collection',
  { assetId },
];

const getBoundingBoxByNodeIdQueryKey = (
  modelId: number,
  revisionId: number,
  nodeId: number
) => [...queryKeyBase(modelId, revisionId), 'node', nodeId, 'bounding-box'];

const getNodeIdByTreeIndexQueryKey = (
  modelId: number,
  revisionId: number,
  treeIndex: number
) => [...queryKeyBase(modelId, revisionId), 'tree-index', treeIndex, 'node-id'];

export const fetchBoundingBoxByNodeIdQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  threeDModel: CogniteCadModel,
  modelId: number,
  revisionId: number,
  nodeId: number,
  options?: FetchQueryOptions<THREE.Box3>
): Promise<THREE.Box3> => {
  return queryClient.fetchQuery(
    getBoundingBoxByNodeIdQueryKey(modelId, revisionId, nodeId),
    () => threeDModel.getBoundingBoxByNodeId(nodeId),
    options
  );
};

export const distancesInFeetAndMeters = (distanceInMeters: number) => {
  const distanceInFeet = distanceInMeters * 3.281;
  const distanceInFeetInt = Math.floor(distanceInFeet);
  const distanceInches = Math.round(12 * (distanceInFeet - distanceInFeetInt)); // 12 inches in a foot
  const distances = `${distanceInMeters.toFixed(
    2
  )} m\n ${distanceInFeetInt}' ${distanceInches}''`;
  return distances;
};

export const fitCameraToAsset = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  viewer: Cognite3DViewer,
  threeDModel: CogniteCadModel,
  assetId: number
) => {
  const { modelId, revisionId } = threeDModel;
  const mappings = await fetchAssetMappingsByAssetIdQuery(
    sdk,
    queryClient,
    modelId,
    revisionId,
    assetId,
    100
  );

  const boundingBoxNodes = await Promise.all(
    mappings.items.map((m) =>
      fetchBoundingBoxByNodeIdQuery(
        sdk,
        queryClient,
        threeDModel,
        modelId,
        revisionId,
        m.nodeId
      )
    )
  );

  const boundingBox = boundingBoxNodes.reduce((accl: THREE.Box3, box) => {
    return box ? accl.union(box) : accl;
  }, new THREE.Box3());

  viewer.fitCameraToBoundingBox(boundingBox, CAMERA_ANIMATION_DURATION, 3);
};

async function fetchAssetNodeCollection(
  sdk: CogniteClient,
  queryClient: QueryClient,
  model: CogniteCadModel,
  assetId?: number
) {
  const { modelId, revisionId } = model;
  return queryClient.fetchQuery(
    getAssetNodeCollectionQueryKey(modelId, revisionId, assetId),
    () => {
      const collection = new AssetNodeCollection(sdk, model);
      collection.executeFilter({ assetId });
      return collection;
    }
  );
}

export const highlightAsset = async (
  sdk: CogniteClient,
  threeDModel: CogniteCadModel,
  assetId: number,
  queryClient: QueryClient
) => {
  const assetNodes = await fetchAssetNodeCollection(
    sdk,
    queryClient,
    threeDModel,
    assetId
  );

  threeDModel.assignStyledNodeCollection(
    assetNodes,
    DefaultNodeAppearance.Highlighted
  );
};

export const ghostAsset = async (
  sdk: CogniteClient,
  threeDModel: CogniteCadModel,
  assetId: number,
  queryClient: QueryClient,
  secondaryModels?: (CogniteCadModel | CognitePointCloudModel)[]
) => {
  const assetNodes = await fetchAssetNodeCollection(
    sdk,
    queryClient,
    threeDModel,
    assetId
  );

  threeDModel.removeAllStyledNodeCollections();
  threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
  secondaryModels?.forEach((model) => {
    if (model instanceof CogniteCadModel) {
      model.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
    } else {
      model.setDefaultPointCloudAppearance({
        color: new THREE.Color('#111111'),
      });
    }
  });
  threeDModel.assignStyledNodeCollection(
    assetNodes,
    DefaultNodeAppearance.Default
  );
};

export const highlightAssetMappedNodes = async (
  threeDModel: CogniteCadModel,
  queryClient: QueryClient
) => {
  const assetNodeCollection = await fetchAssetNodeCollection(
    sdk,
    queryClient,
    threeDModel
  );
  const nonMappedNodeCollection = new InvertedNodeCollection(
    threeDModel,
    assetNodeCollection
  );

  threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
  threeDModel.assignStyledNodeCollection(nonMappedNodeCollection, {
    color: new THREE.Color(30, 30, 30),
  });
};

export const removeAllStyles = (threeDModel: CogniteCadModel) => {
  threeDModel.removeAllStyledNodeCollections();
  threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
};

export const removeAllPointCloudStyles = (
  pointCloudModel: CognitePointCloudModel
) => {
  pointCloudModel.removeAllStyledObjectCollections();
  pointCloudModel.setDefaultPointCloudAppearance({ visible: true });
};

export const fetchNodeIdByTreeIndex = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  threeDModel: CogniteCadModel,
  modelId: number,
  revisionId: number,
  treeIndex: number,
  options?: FetchQueryOptions<number>
): Promise<number> => {
  return queryClient.fetchQuery(
    getNodeIdByTreeIndexQueryKey(modelId, revisionId, treeIndex),
    () => threeDModel.mapTreeIndexToNodeId(treeIndex),
    options
  );
};

export async function getBoundingBoxesByNodeIds(
  sdk: CogniteClient,
  model: CogniteCadModel,
  nodeIds: CogniteInternalId[]
): Promise<Map<number, { node: Node3D; bbox: THREE.Box3 }>> {
  const boundingBoxMap = new Map<number, { node: Node3D; bbox: THREE.Box3 }>();
  const mappedBoundingBoxPromises = sdk.revisions3D.retrieve3DNodes(
    model.modelId,
    model.revisionId,
    nodeIds.map((id) => {
      return { id };
    })
  );

  const mappedBoundingBoxes = await mappedBoundingBoxPromises;
  mappedBoundingBoxes
    .flat()
    .filter((node) => node.boundingBox)
    .forEach((node) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const box = toThreeBox3(node.boundingBox!);
      box.applyMatrix4(model.getModelTransformation());
      boundingBoxMap.set(node.id, { node, bbox: box });
    });

  return boundingBoxMap;
}

export const findClosestAsset = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  threeDModel: CogniteCadModel,
  modelId: number,
  revisionId: number,
  intersection: CadIntersection
) => {
  const { treeIndex } = intersection as CadIntersection;

  const nodeId = await fetchNodeIdByTreeIndex(
    sdk,
    queryClient,
    threeDModel,
    modelId,
    revisionId,
    treeIndex
  );

  const closestAssetId = await fetchClosestAssetIdQuery(
    sdk,
    queryClient,
    modelId,
    revisionId,
    nodeId
  );

  if (closestAssetId) {
    try {
      const assetDetails = await fetchAssetDetails(
        sdk,
        queryClient,
        closestAssetId
      );
      return assetDetails ? closestAssetId : undefined;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error in ThreeD:', e);
    }
  }

  return undefined;
};

const GREP_STRING_SPLITTER = /\s/;
export function grepContains(contentSet: Set<string>, querySet: Set<string>) {
  const content = [...contentSet];
  const query = [...querySet];
  return query.every((queryPart) =>
    content.find((content_part) => content_part.includes(queryPart))
  );
}

export function prepareSearchString(s: string): Set<string> {
  return new Set(
    s
      .trim()
      .toLocaleLowerCase()
      .split(GREP_STRING_SPLITTER)
      .filter((s) => s.length > 0)
  );
}

export const getStateUrl = ({
  revisionId,
  viewState,
  slicingState,
  assetDetailsExpanded,
  selectedAssetId,
  secondaryModels,
  images360,
  assetHighlightMode,
}: {
  revisionId?: number;
  viewState?: ViewerState;
  slicingState?: SlicingState;
  selectedAssetId?: number;
  assetDetailsExpanded?: boolean;
  secondaryModels?: SecondaryModelOptions[];
  images360?: Image360DatasetOptions[];
  assetHighlightMode?: boolean;
}) => {
  const searchParams = new URLSearchParams(window.location.search);
  if (revisionId) {
    searchParams.set(THREE_D_REVISION_ID_QUERY_PARAMETER_KEY, `${revisionId}`);
  } else {
    searchParams.delete(THREE_D_REVISION_ID_QUERY_PARAMETER_KEY);
  }

  if (selectedAssetId) {
    searchParams.set(
      THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY,
      `${selectedAssetId}`
    );
  } else {
    searchParams.delete(THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY);
  }
  if (assetDetailsExpanded) {
    searchParams.set(
      THREE_D_ASSET_DETAILS_EXPANDED_QUERY_PARAMETER_KEY,
      'true'
    );
  } else {
    searchParams.delete(THREE_D_ASSET_DETAILS_EXPANDED_QUERY_PARAMETER_KEY);
  }
  if (assetHighlightMode) {
    searchParams.set(THREE_D_ASSET_HIGHLIGHT_MODE_PARAMETER_KEY, 'true');
  } else {
    searchParams.delete(THREE_D_ASSET_HIGHLIGHT_MODE_PARAMETER_KEY);
  }
  if (secondaryModels) {
    const selectedModels = secondaryModels
      .filter((model) => !!model.applied)
      .map((model) => ({
        modelId: model.modelId,
        revisionId: model.revisionId,
      }));
    searchParams.set(
      THREE_D_SECONDARY_MODELS_QUERY_PARAMETER_KEY,
      JSON.stringify(selectedModels)
    );
  } else {
    searchParams.delete(THREE_D_SECONDARY_MODELS_QUERY_PARAMETER_KEY);
  }

  if (images360) {
    const selectedImages360 = images360
      .filter((img360) => !!img360.applied)
      .map((img360) => ({
        siteId: img360.siteId,
      }));
    searchParams.set(
      THREE_D_CUBEMAP_360_IMAGES_QUERY_PARAMETER_KEY,
      JSON.stringify(selectedImages360)
    );
  } else {
    searchParams.delete(THREE_D_CUBEMAP_360_IMAGES_QUERY_PARAMETER_KEY);
  }

  if (viewState) {
    searchParams.set(
      THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY,
      JSON.stringify(viewState)
    );
  } else {
    searchParams.delete(THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY);
  }

  if (slicingState) {
    searchParams.set(
      THREE_D_SLICING_STATE_QUERY_PARAMETER_KEY,
      JSON.stringify(slicingState)
    );
  } else {
    searchParams.delete(THREE_D_SLICING_STATE_QUERY_PARAMETER_KEY);
  }

  return `${window.location.pathname}?${searchParams}`;
};

export function toThreeBox3(
  boundingBox: BoundingBox3D,
  out?: THREE.Box3
): THREE.Box3 {
  out = out ?? new THREE.Box3();
  out.min.set(boundingBox.min[0], boundingBox.min[1], boundingBox.min[2]);
  out.max.set(boundingBox.max[0], boundingBox.max[1], boundingBox.max[2]);
  return out;
}

export function mixColorsToCSS(
  color1: THREE.Color,
  color2: THREE.Color,
  ratio: number
): string {
  const mixedColor = new THREE.Color();
  ratio = THREE.MathUtils.clamp(ratio, 0, 1);
  mixedColor.r = color1.r * ratio + color2.r * (1 - ratio);
  mixedColor.g = color1.g * ratio + color2.g * (1 - ratio);
  mixedColor.b = color1.b * ratio + color2.b * (1 - ratio);
  return `rgb(${mixedColor.r * 255}, ${mixedColor.g * 255}, ${
    mixedColor.b * 255
  })`;
}

export function isCadIntersection(
  intersection: CadIntersection | PointCloudIntersection
): intersection is CadIntersection {
  return (intersection as CadIntersection).treeIndex !== undefined;
}

export function updateAllPointCloudsPointSize(
  viewer: Cognite3DViewer,
  pointSize: number
) {
  viewer.models.forEach((model) => {
    if (!(model instanceof CognitePointCloudModel)) return;

    model.pointSize = pointSize;
  });
}
export function getMainModelTitle(
  model?: Model3D,
  image360Data?: Image360SiteData
): string {
  return (
    model?.name ?? model?.id.toString() ?? image360Data?.siteName ?? 'No title'
  );
}

export function getMainModelSubtitle(
  isImage360?: boolean,
  modelRevision?: Revision3DWithIndex
): string {
  if (isImage360) {
    return '360 Image';
  } else {
    return `Revision ${modelRevision?.index} - ${
      modelRevision?.published ? 'Published' : 'Unpublished'
    }`;
  }
}
