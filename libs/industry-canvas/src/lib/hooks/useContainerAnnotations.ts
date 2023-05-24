import { ExtendedAnnotation } from '@data-exploration-lib/core';
import zip from 'lodash/zip';
import { useMemo } from 'react';
import {
  getExtendedAnnotationsFromAnnotationsApi,
  getStyledAnnotationFromAnnotation,
} from '@cognite/data-exploration';
import { isNotUndefined } from '../utils/isNotUndefined';
import { IndustryCanvasContainerConfig } from '../types';
import { isNotUndefinedTuple } from '../utils/isNotUndefinedTuple';
import { useAnnotationsMultiple } from './useAnnotationsMultiple';
import { EMPTY_ARRAY } from './constants';

type useContainerAnnotationsParams = {
  container: IndustryCanvasContainerConfig;
  selectedAnnotationId: string | undefined;
  hoverId: string | undefined;
  onMouseOver?: (annotation: ExtendedAnnotation) => void;
  onMouseOut?: (annotation: ExtendedAnnotation) => void;
  onClick?: (annotation: ExtendedAnnotation) => void;
};

export const useContainerAnnotations = ({
  container,
  selectedAnnotationId,
  hoverId,
  onClick,
  onMouseOver,
  onMouseOut,
}: useContainerAnnotationsParams): ExtendedAnnotation[] => {
  const containerConfigs = container.children ?? EMPTY_ARRAY;
  const { data: annotationsApiAnnotations } =
    useAnnotationsMultiple(containerConfigs);

  return useMemo(() => {
    if (annotationsApiAnnotations === undefined) {
      return [];
    }

    const extendedAnnotations = zip(containerConfigs, annotationsApiAnnotations)
      .filter(isNotUndefinedTuple)
      .flatMap(([containerConfig, annotationsForContainerConfig]) =>
        getExtendedAnnotationsFromAnnotationsApi(
          annotationsForContainerConfig,
          containerConfig.id
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
    containerConfigs,
  ]);
};
