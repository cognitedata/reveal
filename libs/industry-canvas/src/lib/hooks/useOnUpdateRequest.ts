import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ContainerConfig,
  UnifiedViewer,
  UnifiedViewerEventListenerMap,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';

import { RuleType } from '../components/ContextualTooltips/AssetTooltip/types';
import { useCommentsUpsertMutation } from '../services/comments/hooks';
import { shamefulOnUpdateRequest } from '../state/useIndustrialCanvasStore';
import { CanvasAnnotation, IndustryCanvasContainerConfig } from '../types';
import { useUserProfile } from '../UserProfileProvider';
import useMetrics from '../utils/tracking/useMetrics';

export type InteractionState = {
  hoverId: string | undefined;
  clickedContainerAnnotationId: string | undefined;
};

export type UpdateHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_UPDATE_REQUEST];

export type IsConditionalFormattingOpenByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, boolean>
>;

export type LiveSensorRulesByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, RuleType[]>
>;

const mergeIfMatchById = <T extends { id: string }, U extends { id: string }>(
  array: T[],
  element: U
): U => {
  const foundElement = array.find((arrElem) => arrElem.id === element.id);

  if (!foundElement) {
    return element;
  }

  return {
    ...element,
    ...foundElement,
  };
};

const containerConfigToIndustryCanvasContainerConfig = (
  containerConfig: ContainerConfig
): IndustryCanvasContainerConfig => {
  return {
    ...containerConfig,
    metadata: {
      ...(containerConfig.metadata ?? {}),
    },
  };
};

export const getNextUpdatedContainers = (
  prevContainers: IndustryCanvasContainerConfig[],
  updatedContainers: ContainerConfig[]
): IndustryCanvasContainerConfig[] => {
  return [
    ...prevContainers.map((prevContainer) =>
      mergeIfMatchById(updatedContainers, prevContainer)
    ),
    ...updatedContainers
      .filter(
        (updatedContainer) =>
          !prevContainers.some(
            (container) => container.id === updatedContainer.id
          )
      )
      .map(containerConfigToIndustryCanvasContainerConfig),
  ];
};

export const getNextUpdatedAnnotations = (
  prevAnnotations: CanvasAnnotation[],
  updatedAnnotations: CanvasAnnotation[]
): CanvasAnnotation[] => {
  return [
    ...prevAnnotations.map((annotation) =>
      mergeIfMatchById(updatedAnnotations, annotation)
    ),
    ...updatedAnnotations.filter(
      (updatedAnnotation) =>
        !prevAnnotations.some(
          (annotation) => annotation.id === updatedAnnotation.id
        )
    ),
  ];
};

const useOnUpdateRequest = ({
  unifiedViewer,
}: {
  unifiedViewer: UnifiedViewer | null;
}): UpdateHandlerFn => {
  const trackUsage = useMetrics();

  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useUserProfile();
  const { mutateAsync: upsertComments } = useCommentsUpsertMutation();
  return useCallback(
    ({ containers, annotations }) => {
      shamefulOnUpdateRequest({
        containers,
        annotations,
        unifiedViewer,
        trackUsage,
        upsertComments,
        searchParams,
        userProfile,
        setSearchParams,
      });
    },
    [
      unifiedViewer,
      trackUsage,
      upsertComments,
      searchParams,
      userProfile,
      setSearchParams,
    ]
  );
};

export default useOnUpdateRequest;
