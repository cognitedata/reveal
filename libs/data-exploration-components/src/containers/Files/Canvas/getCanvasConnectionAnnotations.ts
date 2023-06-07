import { PagedFileReference } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import { getPagedContainerId } from '@data-exploration-components/containers/Files/Canvas/utils';
import {
  getFileIdFromExtendedAnnotation,
  getResourceIdFromExtendedAnnotation,
  getResourceTypeFromExtendedAnnotation,
} from '@data-exploration-components/containers/Files/FilePreview/migration/utils';

import {
  Annotation,
  AnnotationType,
  LineType,
} from '@cognite/unified-file-viewer';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

const numFileLinksBetweenFiles = (
  fromFileId: number,
  toFileId: number,
  annotations: ExtendedAnnotation[]
): number =>
  annotations.filter(
    (annotation) =>
      getResourceTypeFromExtendedAnnotation(annotation) === 'file' &&
      getFileIdFromExtendedAnnotation(annotation) === fromFileId &&
      getResourceIdFromExtendedAnnotation(annotation) === toFileId
  ).length;

const CONNECTION_TARGET_ID = 'file-link-connection-target-id';

export const getCanvasConnectionAnnotations = ({
  pagedFileReferences,
  annotations,
  hoverId,
}: {
  pagedFileReferences: PagedFileReference[];
  annotations: ExtendedAnnotation[];
  hoverId: string | undefined;
}): Annotation[] => {
  if (hoverId === undefined) {
    return [];
  }

  if (annotations.length === 0) {
    return [];
  }

  const hoveredAnnotation = annotations.find(
    (annotation) => annotation.id === hoverId
  );

  if (hoveredAnnotation === undefined) {
    return [];
  }

  if (getResourceTypeFromExtendedAnnotation(hoveredAnnotation) !== 'file') {
    return [];
  }

  const annotatedFileId = getFileIdFromExtendedAnnotation(hoveredAnnotation);
  if (annotatedFileId === undefined) {
    // Note: this should never happen since we are filtering on file annotations
    return [];
  }

  const linkedFileId = getResourceIdFromExtendedAnnotation(hoveredAnnotation);
  if (linkedFileId === undefined) {
    return [];
  }

  // We are using the pagedFileReferences here since we could have the same document
  // multiple times in the same canvas (for different pages).
  return pagedFileReferences
    .filter((pagedFileReference) => pagedFileReference.id === linkedFileId)
    .flatMap<Annotation>((pagedFileReference) => {
      const isSelfReferentialFileLink = annotatedFileId === linkedFileId;

      const isSingleSetOfFileLinksBetweenFiles =
        numFileLinksBetweenFiles(annotatedFileId, linkedFileId, annotations) ===
          1 &&
        numFileLinksBetweenFiles(linkedFileId, annotatedFileId, annotations) ===
          1;

      const targetAnnotation = isSingleSetOfFileLinksBetweenFiles
        ? annotations.find(
            (annotation) =>
              getResourceTypeFromExtendedAnnotation(annotation) === 'file' &&
              getResourceIdFromExtendedAnnotation(annotation) ===
                annotatedFileId &&
              getFileIdFromExtendedAnnotation(annotation) === linkedFileId
          )
        : undefined;

      const isRegionToRegionLink =
        isSingleSetOfFileLinksBetweenFiles && targetAnnotation !== undefined;

      const connections: Annotation[] = isSelfReferentialFileLink
        ? []
        : [
            {
              id: 'connection',
              type: AnnotationType.POLYLINE,
              fromId: hoveredAnnotation.id,
              toId: CONNECTION_TARGET_ID,
              style: {
                stroke: 'blue',
                strokeWidth: 20,
                opacity: 0.5,
                lineType: isRegionToRegionLink
                  ? LineType.RIGHT_ANGLES
                  : LineType.STRAIGHT,
              },
            },
          ];

      const highlightingRectangles = isRegionToRegionLink
        ? [
            {
              type: AnnotationType.RECTANGLE,
              id: CONNECTION_TARGET_ID,
              containerId: getPagedContainerId(
                pagedFileReference.id,
                pagedFileReference.page
              ),
              x: targetAnnotation.x,
              y: targetAnnotation.y,
              width: targetAnnotation.width,
              height: targetAnnotation.height,
              style: {
                stroke: 'blue',
                strokeWidth: 2,
              },
            },
          ]
        : [
            {
              type: AnnotationType.RECTANGLE,
              id: CONNECTION_TARGET_ID,
              containerId: getPagedContainerId(
                pagedFileReference.id,
                pagedFileReference.page
              ),
              x: 0.0,
              y: 0.0,
              width: 1,
              height: 1,
              style: {
                stroke: 'blue',
                strokeWidth: 2,
              },
            },
          ];

      return [...highlightingRectangles, ...connections] as Annotation[];
    });
};
