import { partition } from 'lodash';

import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeAnnotationColor,
  getResourceTypeFromExtendedAnnotation,
} from '@cognite/data-exploration';
import {
  Annotation,
  AnnotationType,
  ContainerType,
  LineType,
  PolylineAnnotation,
  RectangleAnnotation,
  isConnectionPolylineAnnotation,
} from '@cognite/unified-file-viewer';

import { ExtendedAnnotation, isNotUndefined } from '@data-exploration-lib/core';

import { IndustryCanvasContainerConfig } from '../types';

const ONLY_SHOW_REGION_TO_REGION_IF_ONE_TO_ONE = true;

const CONNECTION_OPACITY = 0.5;
const CONNECTION_STROKE_WIDTH = 2;
const FILE_CONNECTION_STROKE =
  getResourceTypeAnnotationColor('file').strokeColor;
const ASSET_CONNECTION_STROKE =
  getResourceTypeAnnotationColor('asset').strokeColor;

const resourceTypeToConnectionStroke = {
  file: FILE_CONNECTION_STROKE,
  asset: ASSET_CONNECTION_STROKE,
};

const getAnnotationToRegionConnection = ({
  sourceAnnotation,
  targetContainer,
  resourceType,
  isSelfReferential = false,
}: {
  sourceAnnotation: ExtendedAnnotation;
  targetContainer: IndustryCanvasContainerConfig;
  resourceType: 'file' | 'asset';
  isSelfReferential?: boolean;
}): Annotation[] => {
  const stroke = resourceTypeToConnectionStroke[resourceType];
  const highlightingRectangleId = `highlighting-rectangle-${targetContainer.id}`;
  const highlightingRectangle: RectangleAnnotation = {
    type: AnnotationType.RECTANGLE,
    id: highlightingRectangleId,
    containerId: targetContainer.id,
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    isSelectable: false,
    style: {
      fill: 'transparent',
      stroke,
      strokeWidth: CONNECTION_STROKE_WIDTH,
      opacity: CONNECTION_OPACITY,
    },
  };

  if (isSelfReferential) {
    return [highlightingRectangle];
  }

  const connection: PolylineAnnotation = {
    id: `connection-${sourceAnnotation.id}}`,
    type: AnnotationType.POLYLINE,
    fromId: sourceAnnotation.id,
    toId: highlightingRectangleId,
    style: {
      stroke,
      strokeWidth: CONNECTION_STROKE_WIDTH,
      opacity: CONNECTION_OPACITY,
    },
    isSelectable: false,
  };

  return [highlightingRectangle, connection];
};

const EMPTY_CONNECTION_ANNOTATIONS: Annotation[] = [];

const getConnectionAnnotations = ({
  sourceAnnotation,
  annotations,
  container,
  shouldAddSelfReferentialHighlighting = false,
}: {
  sourceAnnotation: ExtendedAnnotation;
  container: IndustryCanvasContainerConfig;
  annotations: ExtendedAnnotation[];
  shouldAddSelfReferentialHighlighting?: boolean;
}): Annotation[] => {
  const sourceResourceType =
    getResourceTypeFromExtendedAnnotation(sourceAnnotation);
  if (sourceResourceType === 'asset') {
    return getAssetConnectionAnnotations({
      sourceAnnotation,
      container,
    });
  }

  if (sourceResourceType === 'file') {
    return getFileConnectionAnnotations({
      sourceAnnotation,
      annotations,
      container,
      shouldAddSelfReferentialHighlighting,
    });
  }

  return EMPTY_CONNECTION_ANNOTATIONS;
};

const getAssetConnectionAnnotations = ({
  sourceAnnotation,
  container,
}: {
  sourceAnnotation: ExtendedAnnotation;
  container: IndustryCanvasContainerConfig;
}) => {
  const targetAssetId = getResourceIdFromExtendedAnnotation(sourceAnnotation);
  if (targetAssetId === undefined) {
    return EMPTY_CONNECTION_ANNOTATIONS;
  }

  const linkedAssetContainers = (container.children ?? []).filter(
    (containerConfig) =>
      containerConfig.type === ContainerType.TABLE &&
      containerConfig.metadata.resourceId === targetAssetId
  );

  return linkedAssetContainers.flatMap((targetContainer): Annotation[] =>
    getAnnotationToRegionConnection({
      sourceAnnotation,
      targetContainer,
      resourceType: 'asset',
    })
  );
};

const getFileConnectionAnnotations = ({
  sourceAnnotation,
  annotations,
  container,
  shouldAddSelfReferentialHighlighting,
}: {
  sourceAnnotation: ExtendedAnnotation;
  container: IndustryCanvasContainerConfig;
  annotations: ExtendedAnnotation[];
  shouldAddSelfReferentialHighlighting: boolean;
}) => {
  const sourceFileId = getFileIdFromExtendedAnnotation(sourceAnnotation);
  if (sourceFileId === undefined) {
    // Note: this should never happen since we are filtering on file annotations
    return EMPTY_CONNECTION_ANNOTATIONS;
  }

  const targetFileId = getResourceIdFromExtendedAnnotation(sourceAnnotation);
  if (targetFileId === undefined) {
    return EMPTY_CONNECTION_ANNOTATIONS;
  }

  const isSelfReferentialFileLink = sourceFileId === targetFileId;
  if (!shouldAddSelfReferentialHighlighting && isSelfReferentialFileLink) {
    return EMPTY_CONNECTION_ANNOTATIONS;
  }

  const linkedContainers = (container.children ?? []).filter(
    (containerConfig) =>
      (containerConfig.type === ContainerType.DOCUMENT ||
        containerConfig.type === ContainerType.IMAGE ||
        containerConfig.type === ContainerType.TEXT) &&
      containerConfig.metadata.resourceId === targetFileId
  );

  const connectionAnnotations = linkedContainers.flatMap<Annotation>(
    (targetContainer): Annotation[] => {
      const targetAnnotations = annotations.filter(
        (annotation) =>
          getResourceTypeFromExtendedAnnotation(annotation) === 'file' &&
          getResourceIdFromExtendedAnnotation(annotation) === sourceFileId &&
          getFileIdFromExtendedAnnotation(annotation) === targetFileId
      );

      const isRegionToRegionLink = ONLY_SHOW_REGION_TO_REGION_IF_ONE_TO_ONE
        ? targetAnnotations.length === 1
        : targetAnnotations.length > 0;

      if (!isRegionToRegionLink || isSelfReferentialFileLink) {
        return getAnnotationToRegionConnection({
          sourceAnnotation,
          targetContainer,
          resourceType: 'file',
          isSelfReferential: isSelfReferentialFileLink,
        });
      }

      return targetAnnotations.map(
        (targetAnnotation): PolylineAnnotation => ({
          id: `connection-${sourceAnnotation.id}-${targetAnnotation.id}`,
          type: AnnotationType.POLYLINE,
          fromId: sourceAnnotation.id,
          toId: targetAnnotation.id,
          style: {
            stroke: FILE_CONNECTION_STROKE,
            strokeWidth: CONNECTION_STROKE_WIDTH,
            opacity: CONNECTION_OPACITY,
            lineType: LineType.RIGHT_ANGLES,
          },
          isSelectable: false,
        })
      );
    }
  );

  return connectionAnnotations;
};

export const getIndustryCanvasConnectionAnnotations = ({
  container,
  selectedContainer,
  annotations,
  hoverId,
  clickedId,
  shouldShowAllConnectionAnnotations,
}: {
  container: IndustryCanvasContainerConfig;
  selectedContainer: IndustryCanvasContainerConfig | undefined;
  annotations: ExtendedAnnotation[];
  hoverId: string | undefined;
  clickedId: string | undefined;
  shouldShowAllConnectionAnnotations: boolean;
}): Annotation[] => {
  const alreadyConnectedAnnotations = new Set<string>();
  const connectionAnnotations = annotations.flatMap((sourceAnnotation) => {
    if (alreadyConnectedAnnotations.has(sourceAnnotation.id)) {
      return EMPTY_CONNECTION_ANNOTATIONS;
    }

    const connectionAnnotations = getConnectionAnnotations({
      sourceAnnotation: sourceAnnotation,
      annotations,
      container,
    });

    // Populate the set of already connected annotations to avoid duplicate connections
    connectionAnnotations
      .filter(isConnectionPolylineAnnotation)
      .map((connectionAnnotation) => connectionAnnotation.toId)
      .filter(isNotUndefined)
      .forEach((id) => alreadyConnectedAnnotations.add(id));

    return connectionAnnotations;
  });

  if (shouldShowAllConnectionAnnotations) {
    return connectionAnnotations;
  }

  const [polylineConnectionAnnotations, highlightingRectangles] = partition(
    connectionAnnotations,
    isConnectionPolylineAnnotation
  );

  const annotationToContainerIdMap = new Map<string, string>();
  [...highlightingRectangles, ...annotations].forEach((annotation) => {
    const { containerId } = annotation;
    if (containerId === undefined) {
      return;
    }
    annotationToContainerIdMap.set(annotation.id, containerId);
  });

  const shouldShowSelectedContainerConnectionAnnotations =
    clickedId === undefined && selectedContainer !== undefined;

  const linkedConnectionAnnotations = polylineConnectionAnnotations.filter(
    (annotation) => {
      const { fromId, toId } = annotation;
      if (
        [fromId, toId].includes(hoverId) ||
        [fromId, toId].includes(clickedId)
      ) {
        return true;
      }

      if (shouldShowSelectedContainerConnectionAnnotations) {
        return (
          (fromId !== undefined &&
            annotationToContainerIdMap.get(fromId) === selectedContainer?.id) ||
          (toId !== undefined &&
            annotationToContainerIdMap.get(toId) === selectedContainer?.id)
        );
      }

      return false;
    }
  );

  const linkedConnectionAnnotationsEndPointIds = new Set(
    linkedConnectionAnnotations.flatMap((annotation) => [
      annotation.fromId,
      annotation.toId,
    ])
  );
  const linkedHighlightingAnnotations = highlightingRectangles.filter(
    (annotation) => linkedConnectionAnnotationsEndPointIds.has(annotation.id)
  );

  return [...linkedConnectionAnnotations, ...linkedHighlightingAnnotations];
};
