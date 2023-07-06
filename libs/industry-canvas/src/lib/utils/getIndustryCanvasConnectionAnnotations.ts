import { uniqBy } from 'lodash';

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
} from '@cognite/unified-file-viewer';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

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
}: {
  sourceAnnotation: ExtendedAnnotation;
  targetContainer: IndustryCanvasContainerConfig;
  resourceType: 'file' | 'asset';
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

const EMPTY_CONNECTION_ANNOTATIONS = {
  connectionAnnotations: [],
  targetAnnotationIds: [],
};

const getConnectionAnnotations = ({
  sourceAnnotation,
  annotations,
  container,
}: {
  sourceAnnotation: ExtendedAnnotation;
  container: IndustryCanvasContainerConfig;
  annotations: ExtendedAnnotation[];
}): {
  connectionAnnotations: Annotation[];
  targetAnnotationIds?: string[];
} => {
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

  return {
    targetAnnotationIds: [],
    connectionAnnotations: linkedAssetContainers.flatMap(
      (targetContainer): Annotation[] =>
        getAnnotationToRegionConnection({
          sourceAnnotation,
          targetContainer,
          resourceType: 'asset',
        })
    ),
  };
};

const getFileConnectionAnnotations = ({
  sourceAnnotation,
  annotations,
  container,
}: {
  sourceAnnotation: ExtendedAnnotation;
  container: IndustryCanvasContainerConfig;
  annotations: ExtendedAnnotation[];
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
  if (isSelfReferentialFileLink) {
    return EMPTY_CONNECTION_ANNOTATIONS;
  }

  const linkedContainers = (container.children ?? []).filter(
    (containerConfig) =>
      (containerConfig.type === ContainerType.DOCUMENT ||
        containerConfig.type === ContainerType.IMAGE ||
        containerConfig.type === ContainerType.TEXT) &&
      containerConfig.metadata.resourceId === targetFileId
  );

  const targetAnnotationIds: string[] = [];

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

      if (!isRegionToRegionLink) {
        return getAnnotationToRegionConnection({
          sourceAnnotation,
          targetContainer,
          resourceType: 'file',
        });
      }

      targetAnnotationIds.push(...targetAnnotations.map((a) => a.id));

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

  return { connectionAnnotations, targetAnnotationIds };
};

export const getIndustryCanvasConnectionAnnotations = ({
  container,
  annotations,
  hoverId,
  shouldShowAllConnectionAnnotations,
}: {
  container: IndustryCanvasContainerConfig;
  annotations: ExtendedAnnotation[];
  hoverId: string | undefined;
  shouldShowAllConnectionAnnotations: boolean;
}): Annotation[] => {
  if (shouldShowAllConnectionAnnotations) {
    const alreadyConnectedAnnotations = new Set<string>();

    const connectionAnnotations = annotations.flatMap((annotation) => {
      if (alreadyConnectedAnnotations.has(annotation.id)) {
        return [];
      }

      const { connectionAnnotations, targetAnnotationIds } =
        getConnectionAnnotations({
          sourceAnnotation: annotation,
          annotations,
          container,
        });

      targetAnnotationIds?.forEach((id) => alreadyConnectedAnnotations.add(id));

      return connectionAnnotations;
    });

    // There might be duplicated highlight rectangles if there are multiple connections to the same file
    return uniqBy(connectionAnnotations, 'id');
  }

  const hoveredAnnotation = annotations.find(
    (annotation) => annotation.id === hoverId
  );
  if (hoveredAnnotation === undefined) {
    return [];
  }

  return getConnectionAnnotations({
    sourceAnnotation: hoveredAnnotation,
    annotations,
    container,
  }).connectionAnnotations;
};
