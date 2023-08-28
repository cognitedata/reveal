import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ContainerConfig,
  ContainerType,
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

const transformRecursive = <T extends { children?: T[] }>(
  container: T,
  transform: (fn: T) => T
): T =>
  transform({
    ...container,
    ...(container.children !== undefined && Array.isArray(container.children)
      ? {
          children: container.children.map((child) =>
            transformRecursive(child, transform)
          ),
        }
      : {}),
  });

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

export const getNextUpdatedContainer = (
  container: IndustryCanvasContainerConfig,
  updatedContainers: ContainerConfig[]
): IndustryCanvasContainerConfig => {
  const containerWithNewContainersIfNecessary = addNewContainers(
    container,
    updatedContainers
  );

  // Update the existing container(s) if necessary
  return transformRecursive(
    containerWithNewContainersIfNecessary,
    (container) => mergeIfMatchById(updatedContainers, container)
  );
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

const containerConfigToIndustryCanvasContainerConfig = (
  containerConfig: ContainerConfig
): IndustryCanvasContainerConfig => {
  return {
    ...containerConfig,
    metadata: {
      ...(containerConfig.metadata ?? {}),
    },
    // TODO: Remove this cast. For some reason, even when you explicitly set the metadata, it complains about the metadata being optional
  } as IndustryCanvasContainerConfig;
};

// NOTE: We assume that the root container is a flexible layout since UFV only
//       supports updating flexible layouts.
const addNewContainers = (
  rootContainer: IndustryCanvasContainerConfig,
  containersToAdd: ContainerConfig[]
): IndustryCanvasContainerConfig => {
  const newContainers = containersToAdd.filter(
    (container) =>
      !rootContainer.children?.some(
        (child: IndustryCanvasContainerConfig) => container.id === child.id
      )
  );
  return {
    ...rootContainer,
    ...(rootContainer.type === ContainerType.FLEXIBLE_LAYOUT &&
    rootContainer.children !== undefined &&
    Array.isArray(rootContainer.children)
      ? {
          children: [
            ...rootContainer.children,
            ...newContainers.map(
              (container): IndustryCanvasContainerConfig =>
                containerConfigToIndustryCanvasContainerConfig(container)
            ),
          ],
        }
      : {}),
  };
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
