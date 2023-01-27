import { PagedFileReference } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import { getPagedContainerId } from '@data-exploration-components/containers/Files/Canvas/utils';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useAnnotationsMultiple } from '@data-exploration-lib/domain-layer';
import zip from 'lodash/zip';
import { useMemo } from 'react';
import getExtendedAnnotationsFromAnnotationsApi from '../FilePreview/FilePreviewUFV/Annotations/getExtendedAnnotationsFromAnnotationsApi';
import { isNotUndefined } from '@data-exploration-components/utils';
import { getStyledAnnotationFromAnnotation } from '../FilePreview/FilePreviewUFV/utils';
import { isNotUndefinedTuple } from './isNotUndefinedTuple';

type useCanvasAnnotationsParams = {
  files: PagedFileReference[];
  selectedAnnotation: ExtendedAnnotation | undefined;
  hoverId: string | undefined;
  onMouseOver?: (annotation: ExtendedAnnotation) => void;
  onMouseOut?: (annotation: ExtendedAnnotation) => void;
  onClick?: (annotation: ExtendedAnnotation) => void;
};

export const useCanvasAnnotations = ({
  files: pagedFileReferences,
  selectedAnnotation,
  hoverId,
  onClick,
  onMouseOver,
  onMouseOut,
}: useCanvasAnnotationsParams): ExtendedAnnotation[] => {
  const fileIds = useMemo(
    () => pagedFileReferences.map((file) => file.id),
    [pagedFileReferences]
  );
  const annotationsApiAnnotations =
    useAnnotationsMultiple(pagedFileReferences).data;

  return useMemo(() => {
    if (annotationsApiAnnotations === undefined) {
      return [];
    }

    const extendedAnnotations = zip(
      pagedFileReferences,
      annotationsApiAnnotations
    )
      .filter(isNotUndefinedTuple)
      .flatMap(([pagedFileReference, annotationsForPagedFileReference]) =>
        getExtendedAnnotationsFromAnnotationsApi(
          annotationsForPagedFileReference,
          getPagedContainerId(pagedFileReference.id, pagedFileReference.page)
        )
      )
      .filter(isNotUndefined)
      .map((annotation) => {
        const isSelected = selectedAnnotation?.id === annotation.id;
        const isOnHover = hoverId === String(annotation.id);
        return getStyledAnnotationFromAnnotation(
          annotation,
          isSelected,
          false,
          isOnHover
        );
      })
      .map(
        (annotation) =>
          ({
            ...annotation,
            onClick: (e: any, annotation: ExtendedAnnotation) => {
              e.cancelBubble = true;
              if (onClick) {
                onClick(annotation);
              }
            },
            onMouseOver: (e: any, annotation: ExtendedAnnotation) => {
              e.cancelBubble = true;
              if (onMouseOver) {
                onMouseOver(annotation);
              }
            },
            onMouseOut: (e: any, annotation: ExtendedAnnotation) => {
              e.cancelBubble = true;
              if (onMouseOut) {
                onMouseOut(annotation);
              }
            },
          } as ExtendedAnnotation)
      );

    return extendedAnnotations;
  }, [
    onClick,
    onMouseOver,
    onMouseOut,
    selectedAnnotation,
    fileIds,
    hoverId,
    annotationsApiAnnotations,
  ]);
};
