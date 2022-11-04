import {
  AssetNodeCollection,
  CadIntersection,
  Cognite3DModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
  THREE,
  ViewerState,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import {
  fetchAssetMappingsByAssetIdQuery,
  fetchClosestAssetIdQuery,
} from 'app/containers/ThreeD/hooks';

import { FetchQueryOptions, QueryClient } from 'react-query';

const THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY = 'viewerState';
export const THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY = 'selectedAssetId';

export const MINIMUM_BOUNDINGBOX_SIZE = 0.001;
export const CAMERA_ANIMATION_DURATION = 500;

const getBoundingBoxByNodeIdQueryKey = (
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
  'node',
  nodeId,
  'bounding-box',
];

export const fetchBoundingBoxByNodeIdQuery = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  threeDModel: Cognite3DModel,
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

export const fitCameraToAsset = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  viewer: Cognite3DViewer,
  threeDModel: Cognite3DModel,
  modelId: number,
  revisionId: number,
  assetId: number
) => {
  const mappings = await fetchAssetMappingsByAssetIdQuery(
    sdk,
    queryClient,
    modelId,
    revisionId,
    assetId,
    100
  );

  const boundingBoxNodes = await Promise.all(
    mappings.items.map(m =>
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

export const highlightAsset = (
  sdk: CogniteClient,
  threeDModel: Cognite3DModel,
  assetId: number
) => {
  const assetNodes = new AssetNodeCollection(sdk, threeDModel);
  assetNodes.executeFilter({ assetId });

  threeDModel.removeAllStyledNodeCollections();
  threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
  threeDModel.assignStyledNodeCollection(
    assetNodes,
    DefaultNodeAppearance.Highlighted
  );
};

export const ghostAsset = (
  sdk: CogniteClient,
  threeDModel: Cognite3DModel,
  assetId: number
) => {
  const assetNodes = new AssetNodeCollection(sdk, threeDModel);
  assetNodes.executeFilter({ assetId });

  threeDModel.removeAllStyledNodeCollections();
  threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
  threeDModel.assignStyledNodeCollection(
    assetNodes,
    DefaultNodeAppearance.Default
  );
};

export const removeAllStyles = (threeDModel: Cognite3DModel) => {
  threeDModel.removeAllStyledNodeCollections();
  threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
};

const getNodeIdByTreeIndexQueryKey = (
  modelId: number,
  revisionId: number,
  treeIndex: number
) => [
  'cdf',
  '3d',
  'model',
  modelId,
  'revision',
  revisionId,
  'tree-index',
  treeIndex,
  'node-id',
];

export const fetchNodeIdByTreeIndex = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  threeDModel: Cognite3DModel,
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

export const findClosestAsset = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  threeDModel: Cognite3DModel,
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

  return closestAssetId;
};

export const getURLWithThreeDViewerState = (state: string): string => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  params.append(THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY, state);

  return `${window.location.origin}${
    window.location.pathname
  }?${params.toString()}`;
};

export const parseThreeDViewerStateFromURL = (): {
  viewerState?: ViewerState;
} => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const viewerStateParam = params.get(THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY);
  params.delete(THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY);

  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}?${params.toString()}`
  );

  let viewerState: ViewerState | undefined;
  try {
    viewerState = JSON.parse(viewerStateParam ?? '');
  } catch {
    viewerState = undefined;
  }

  return {
    viewerState,
  };
};
