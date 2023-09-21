/* eslint-disable prettier/prettier */
import { FetchQueryOptions, QueryClient } from '@tanstack/react-query';
import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

import {
  AssetNodeCollection,
  CadIntersection,
  CogniteCadModel,
  Cognite3DViewer,
  ViewerState,
  PointCloudIntersection,
  CognitePointCloudModel,
  CogniteModel,
  Image360Collection,
  Image360Annotation,
  Image360,
  Image360AnnotationAssetQueryResult,
} from '@cognite/reveal';
import {
  CogniteClient,
  BoundingBox3D,
  CogniteInternalId,
  Node3D,
  Model3D,
  AnnotationFilterProps,
  AnnotationModel,
  AnnotationData,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
} from '@cognite/sdk';

import { TFunction } from '@data-exploration-lib/core';
import {
  Image360SiteData,
  Revision3DWithIndex,
} from '@data-exploration-lib/domain-layer';

import {
  Image360DatasetOptions,
  SecondaryModelOptions,
  SlicingState,
} from './contexts/ThreeDContext';
import {
  fetchAssetDetails,
  fetchAssetMappingsByAssetIdQuery,
  fetchClosestAssetIdQuery,
  PointsOfInterestCollection,
} from './hooks';

export const THREE_D_VIEWER_STATE_QUERY_PARAMETER_KEY = 'viewerState';
export const THREE_D_SLICING_STATE_QUERY_PARAMETER_KEY = 'slicingState';
export const THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY = 'selectedAssetId';
export const THREE_D_ASSET_DETAILS_EXPANDED_QUERY_PARAMETER_KEY = 'expanded';
export const THREE_D_ASSET_HIGHLIGHT_MODE_PARAMETER_KEY = 'hl_mode';
export const THREE_D_SECONDARY_MODELS_QUERY_PARAMETER_KEY = 'secondaryModels';
export const THREE_D_POINTS_OF_INTEREST_QUERY_PARAMETER_KEY =
  'pointsOfInterest';
export const THREE_D_REVISION_ID_QUERY_PARAMETER_KEY = 'revisionId';
export const THREE_D_CUBEMAP_360_IMAGES_QUERY_PARAMETER_KEY = 'images360';

export const MINIMUM_BOUNDINGBOX_SIZE = 0.001;
export const CAMERA_ANIMATION_DURATION = 500;
export const IMAGE_360_POSITION_THRESHOLD = 0.0001;
export const CAMERA_ANIMATION_RADIUS = 3;

export const SECONDARY_MODEL_DISPLAY_LIMIT = 20;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type AssetSelectionContext = {
  model: CogniteModel | Image360Collection;
  imageAnnotation?: Image360Annotation | undefined;
  imageEntity?: Image360 | undefined;
};

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
  assetSelectionContext: AssetSelectionContext,
  assetId: number
) => {
  const threeDModel = assetSelectionContext.model;

  if (!threeDModel) {
    return;
  }

  if (threeDModel instanceof CogniteCadModel) {
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

    viewer.fitCameraToBoundingBox(
      boundingBox,
      CAMERA_ANIMATION_DURATION,
      CAMERA_ANIMATION_RADIUS
    );
  }
  if (threeDModel instanceof CognitePointCloudModel) {
    const annotation = await getAnnotationByAssetId(sdk, threeDModel, assetId);
    if (annotation === undefined) {
      return;
    }
    const annotationId = annotation.id;

    threeDModel.traverseStylableObjects((annotationMetadata) => {
      if (annotationMetadata.annotationId === annotationId) {
        viewer.fitCameraToBoundingBox(
          annotationMetadata.boundingBox,
          CAMERA_ANIMATION_DURATION,
          CAMERA_ANIMATION_RADIUS
        );
      }
    });
  }

  if (is360ImageCollection(threeDModel)) {
    const annotationCandidates = await threeDModel.findImageAnnotations({
      assetRef: { id: assetId },
    });

    const selectedAnnotation = chooseMostApplicable360Annotation(
      assetSelectionContext,
      annotationCandidates
    );

    if (selectedAnnotation === undefined) {
      return;
    }

    await viewer.enter360Image(
      selectedAnnotation.image,
      selectedAnnotation.revision
    );

    const newTarget = selectedAnnotation.annotation.getCenter();
    const newCamera = viewer.cameraManager.getCamera().clone();
    newCamera.lookAt(newTarget);
    const targetRotation = new THREE.Quaternion().setFromEuler(
      newCamera.rotation
    );

    const startRotation = viewer.cameraManager
      .getCameraState()
      .rotation.clone();

    const tweenState = { way: 0 };
    const tween = new TWEEN.Tween(tweenState)
      .to({ way: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        const currentRotation = new THREE.Quaternion().slerpQuaternions(
          startRotation,
          targetRotation,
          tweenState.way
        );
        viewer.cameraManager.setCameraState({
          rotation: currentRotation,
        });
      })
      .start();

    tween.update(TWEEN.now());
  }
};

function chooseMostApplicable360Annotation(
  assetSelectionContext: AssetSelectionContext,
  annotationCandidates: Image360AnnotationAssetQueryResult[]
): Image360AnnotationAssetQueryResult | undefined {
  if (annotationCandidates.length === 0) {
    return undefined;
  }

  const matchingAnnotation = findMatchingAnnotation(
    assetSelectionContext.imageAnnotation
  );

  if (matchingAnnotation !== undefined) {
    return matchingAnnotation;
  }

  const annotationInSameEntity = findAnnotationInSameEntity(
    assetSelectionContext.imageEntity
  );

  if (annotationInSameEntity !== undefined) {
    return annotationInSameEntity;
  }

  return annotationCandidates[0];

  function findMatchingAnnotation(
    queryAnnotation: Image360Annotation | undefined
  ): Image360AnnotationAssetQueryResult | undefined {
    if (queryAnnotation === undefined) {
      return undefined;
    }

    return annotationCandidates.find(
      (candidate) => candidate.annotation === queryAnnotation
    );
  }

  function findAnnotationInSameEntity(
    imageEntity: Image360 | undefined
  ): Image360AnnotationAssetQueryResult | undefined {
    if (imageEntity === undefined) {
      return undefined;
    }

    return annotationCandidates.find(
      (candidate) => candidate.image === imageEntity
    );
  }
}

export async function fetchAssetNodeCollection(
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

export function is360ImageCollection(
  model: CogniteModel | Image360Collection
): model is Image360Collection {
  return 'image360Entities' in model && model.image360Entities !== undefined;
}

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

export async function getAnnotationByAssetId(
  sdk: CogniteClient,
  model: CognitePointCloudModel,
  assetId: number
): Promise<AnnotationModel | undefined> {
  const { modelId } = model;

  const annotationFilterProps: AnnotationFilterProps = {
    annotatedResourceType: 'threedmodel',
    annotatedResourceIds: [{ id: modelId }],
    annotationType: 'pointcloud.BoundingVolume',
    data: {
      assetRef: { id: assetId },
    },
  };

  const annotations = await sdk.annotations.list({
    limit: 1,
    filter: annotationFilterProps,
  });

  return annotations.items[0];
}

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

function isAssetLinkAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const assetLinkData =
    annotationData as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return (
    assetLinkData.text !== undefined && assetLinkData.textRegion !== undefined
  );
}

export const getAssetIdFromImageAnnotation = (annotation: AnnotationModel) => {
  if (!isAssetLinkAnnotationData(annotation.data)) {
    return undefined;
  }

  return annotation.data.assetRef.id;
};

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
  pointsOfInterest,
  images360,
  assetHighlightMode,
}: {
  pointsOfInterest?: PointsOfInterestCollection[];
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
  if (pointsOfInterest) {
    const selectedPointsOfInterest = pointsOfInterest
      .filter((poi) => !!poi.applied)
      .map((poi) => ({
        id: poi.externalId,
      }));
    searchParams.set(
      THREE_D_POINTS_OF_INTEREST_QUERY_PARAMETER_KEY,
      JSON.stringify(selectedPointsOfInterest)
    );
  } else {
    searchParams.delete(THREE_D_POINTS_OF_INTEREST_QUERY_PARAMETER_KEY);
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
  t: TFunction,
  model?: Model3D,
  image360Data?: Image360SiteData
): string {
  return (
    model?.name ??
    model?.id.toString() ??
    image360Data?.siteName ??
    t('NO_TITLE', 'No title')
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
