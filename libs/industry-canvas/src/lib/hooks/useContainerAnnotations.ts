import { isNotUndefined } from '../utils/isNotUndefined';
import { getContainerId } from '../utils/utils';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useAnnotationsMultiple } from './useAnnotationsMultiple';
import zip from 'lodash/zip';
import { useMemo } from 'react';
import { getExtendedAnnotationsFromAnnotationsApi } from '@cognite/data-exploration';
import { getStyledAnnotationFromAnnotation } from '@cognite/data-exploration';
import { isNotUndefinedTuple } from '../utils/isNotUndefinedTuple';
import { ContainerReference } from '../types';

type useContainerAnnotationsParams = {
  containerReferences: ContainerReference[];
  selectedAnnotationId: string | undefined;
  hoverId: string | undefined;
  onMouseOver?: (annotation: ExtendedAnnotation) => void;
  onMouseOut?: (annotation: ExtendedAnnotation) => void;
  onClick?: (annotation: ExtendedAnnotation) => void;
};

export const useContainerAnnotations = ({
  containerReferences,
  selectedAnnotationId,
  hoverId,
  onClick,
  onMouseOver,
  onMouseOut,
}: useContainerAnnotationsParams): ExtendedAnnotation[] => {
  const { data: annotationsApiAnnotations } =
    useAnnotationsMultiple(containerReferences);

  return useMemo(() => {
    if (annotationsApiAnnotations === undefined) {
      return [];
    }

    const extendedAnnotations = zip(
      containerReferences,
      annotationsApiAnnotations
    )
      .filter(isNotUndefinedTuple)
      .flatMap(([containerReference, annotationsForContainerReference]) =>
        getExtendedAnnotationsFromAnnotationsApi(
          annotationsForContainerReference,
          getContainerId(containerReference)
        )
      )
      .filter(isNotUndefined)
      .map((annotation) => {
        const isSelected = selectedAnnotationId === annotation.id;
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
    selectedAnnotationId,
    hoverId,
    annotationsApiAnnotations,
    containerReferences,
  ]);
};
