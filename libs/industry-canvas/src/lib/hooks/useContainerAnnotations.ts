import { isNotUndefined } from '../utils/isNotUndefined';
import { getContainerId } from '../utils/utils';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useAnnotationsMultiple } from './useAnnotationsMultiple';
import zip from 'lodash/zip';
import { useMemo, useRef } from 'react';
import { getExtendedAnnotationsFromAnnotationsApi } from '@cognite/data-exploration';
import { getStyledAnnotationFromAnnotation } from '@cognite/data-exploration';
import { isNotUndefinedTuple } from '../utils/isNotUndefinedTuple';
import { ContainerReference } from '../types';

type useContainerAnnotationsParams = {
  containerReferences: ContainerReference[];
  selectedAnnotation: ExtendedAnnotation | undefined;
  hoverId: string | undefined;
  onMouseOver?: (annotation: ExtendedAnnotation) => void;
  onMouseOut?: (annotation: ExtendedAnnotation) => void;
  onClick?: (annotation: ExtendedAnnotation) => void;
};

export const useContainerAnnotations = ({
  containerReferences,
  selectedAnnotation,
  hoverId,
  onClick,
  onMouseOver,
  onMouseOut,
}: useContainerAnnotationsParams): ExtendedAnnotation[] => {
  const previousAnnotationsRef = useRef<ExtendedAnnotation[]>([]);

  // Now the container references change every time the user moves a container. Do we want to call the API every time?
  // TODO: Investigate trigger this only when new containers is added or removed.
  const { data: annotationsApiAnnotations, isLoading } =
    useAnnotationsMultiple(containerReferences);

  const memoizedAnnotations = useMemo(() => {
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
    hoverId,
    annotationsApiAnnotations,
    containerReferences,
  ]);

  // Before the annotations would flicker when the user moved the container around.
  // This is because the annotationsApiAnnotations first is undefined (while the API call is being made), and returned an empty array.
  // Now we return the previous annotations if the API call is not done yet.
  if (isLoading) {
    return previousAnnotationsRef.current;
  }
  const extendedAnnotations = memoizedAnnotations;
  previousAnnotationsRef.current = extendedAnnotations;
  return extendedAnnotations;
};
