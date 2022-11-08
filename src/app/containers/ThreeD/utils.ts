import sdk from '@cognite/cdf-sdk-singleton';
import {
  AssetNodeCollection,
  CadIntersection,
  Cognite3DModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
  NodeOutlineColor,
  THREE,
  ViewerState,
} from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import {
  fetchAssetMappingsByAssetIdQuery,
  fetchClosestAssetIdQuery,
} from 'app/containers/ThreeD/hooks';

import { FetchQueryOptions, QueryClient } from 'react-query';

export const THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY = 'viewerState';
export const THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY = 'selectedAssetId';
export const THREE_D_ASSET_DETAILS_EXPANDED_QUERY_PARAMETER_KEY = 'expanded';

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

export const outlineAssetMappedNodes = (threeDModel: Cognite3DModel) => {
  const allAssetMappedNodes = new AssetNodeCollection(sdk, threeDModel!);
  // When no asset ID is provided, all nodes mapped to assets are included
  allAssetMappedNodes.executeFilter({});
  threeDModel?.assignStyledNodeCollection(allAssetMappedNodes, {
    renderGhosted: false,
    outlineColor: NodeOutlineColor.Red,
  });
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

const GREP_STRING_SPLITTER = /\s/;
export function grepContains(contentSet: Set<string>, querySet: Set<string>) {
  const content = [...contentSet];
  const query = [...querySet];
  return query.every(queryPart =>
    content.find(content_part => content_part.includes(queryPart))
  );
}

export function prepareSearchString(s: string): Set<string> {
  return new Set(
    s
      .trim()
      .toLocaleLowerCase()
      .split(GREP_STRING_SPLITTER)
      .filter(s => s.length > 0)
  );
}

export const getStateUrl = ({
  viewState,
  assetDetailsExpanded,
  selectedAssetId,
}: {
  viewState?: ViewerState;
  selectedAssetId?: number;
  assetDetailsExpanded?: boolean;
}) => {
  const searchParams = new URLSearchParams(window.location.search);
  if (viewState) {
    searchParams.set(
      THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY,
      JSON.stringify(viewState)
    );
  } else {
    searchParams.delete(THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY);
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

  return `${window.location.pathname}?${searchParams}`;
};
