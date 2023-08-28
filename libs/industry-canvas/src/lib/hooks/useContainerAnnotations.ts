import { useCallback, useMemo } from 'react';

import zip from 'lodash/zip';

import {
  getExtendedAnnotationsFromAnnotationsApi,
  getStyledAnnotationFromAnnotation,
} from '@cognite/data-exploration';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { MetricEvent } from '../constants';
import {
  setInteractionState,
  useIndustrialCanvasStore,
} from '../state/useIndustrialCanvasStore';
import { IndustryCanvasContainerConfig } from '../types';
import { isNotUndefined } from '../utils/isNotUndefined';
import { isNotUndefinedTuple } from '../utils/isNotUndefinedTuple';
import useMetrics from '../utils/tracking/useMetrics';

import { EMPTY_ARRAY } from './constants';
import { useAnnotationsMultiple } from './useAnnotationsMultiple';

type useContainerAnnotationsParams = {
  container: IndustryCanvasContainerConfig;
};

export const useContainerAnnotations = ({
  container,
}: useContainerAnnotationsParams): ExtendedAnnotation[] => {
  const trackUsage = useMetrics();
  const containerConfigs = container.children ?? EMPTY_ARRAY;
  const { data: annotationsApiAnnotations } =
    useAnnotationsMultiple(containerConfigs);
  const { hoverId, clickedContainerAnnotationId } = useIndustrialCanvasStore(
    (state) => ({
      hoverId: state.interactionState.hoverId,
      clickedContainerAnnotationId:
        state.interactionState.clickedContainerAnnotationId,
    })
  );

  const onClick = useCallback(
    (annotation: ExtendedAnnotation) => {
      setInteractionState((prevInteractionState) => {
        const wasAlreadyClicked =
          prevInteractionState.clickedContainerAnnotationId === annotation.id;
        trackUsage(MetricEvent.CONTAINER_ANNOTATION_CLICKED, {
          annotatedResourceType: annotation.metadata.annotationType,
          wasAlreadyClicked,
        });
        return {
          clickedContainerId: undefined,
          hoverId: undefined,
          clickedContainerAnnotationId: wasAlreadyClicked
            ? undefined
            : annotation.id,
        };
      });
    },
    [trackUsage]
  );

  const onMouseOver = useCallback((annotation: ExtendedAnnotation) => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: annotation.id,
    }));
  }, []);

  const onMouseOut = useCallback(() => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: undefined,
    }));
  }, []);

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
        const isSelected = clickedContainerAnnotationId === annotation.id;
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
            onMouseOut: (e: any) => {
              e.cancelBubble = true;
              if (onMouseOut) {
                onMouseOut();
              }
            },
          } as ExtendedAnnotation)
      );

    return extendedAnnotations;
  }, [
    onClick,
    clickedContainerAnnotationId,
    hoverId,
    annotationsApiAnnotations,
    containerConfigs,
  ]);
};
