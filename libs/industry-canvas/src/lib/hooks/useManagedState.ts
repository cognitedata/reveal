import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ContainerType,
  ContainerConfig,
  UnifiedViewerEventListenerMap,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';
import {
  getContainerId,
  getContainerReferencesWithUpdatedDimensions,
} from '../utils/utils';
import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceWithoutDimensions,
  IndustryCanvasState,
} from '../types';
import { useShamefullySyncContainerFromContainerReferences } from './useShamefullySyncContainerFromContainerReferences';
import {
  useHistory,
  UseCanvasStateHistoryReturnType,
} from './useCanvasStateHistory';
import { useIndustryCanvasService } from './useIndustryCanvasService';

export type InteractionState = {
  hoverId: string | undefined;
  clickedContainerReferenceId: string | undefined;
  selectedAnnotationId: string | undefined;
};

type UpdateHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_UPDATE_REQUEST];

type DeleteHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_DELETE_REQUEST];

export type UseManagedStateReturnType = {
  container: ContainerConfig;
  canvasAnnotations: CanvasAnnotation[];
  containerReferences: ContainerReference[];
  addContainerReferences: (containerReference: ContainerReference[]) => void;
  updateContainerReference: (
    containerReference: ContainerReferenceWithoutDimensions
  ) => void;
  removeContainerReference: (containerReference: ContainerReference) => void;
  onUpdateRequest: UpdateHandlerFn;
  onDeleteRequest: DeleteHandlerFn;
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  redo: UseCanvasStateHistoryReturnType['redo'];
  undo: UseCanvasStateHistoryReturnType['undo'];
};

const transformRecursive = (
  container: ContainerConfig,
  transform: (fn: ContainerConfig) => ContainerConfig
): ContainerConfig =>
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

const removeRecursive = (
  container: ContainerConfig,
  shouldRemoveContainer: (fn: ContainerConfig) => boolean
): ContainerConfig => ({
  ...container,
  ...(container.children !== undefined && Array.isArray(container.children)
    ? {
        children: container.children
          .filter((child) => !shouldRemoveContainer(child))
          .map((child) => removeRecursive(child, shouldRemoveContainer)),
      }
    : {}),
});

const mergeIfMatchById = <T extends { id?: string }>(
  array: T[],
  element: T
) => {
  const foundElement = array.find((arrElem) => arrElem.id === element.id);

  if (!foundElement) {
    return element;
  }

  return {
    ...element,
    ...foundElement,
  };
};

const getNextUpdatedContainer = (
  container: ContainerConfig,
  updatedContainers: ContainerConfig[]
): ContainerConfig => {
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

// NOTE: We assume that the root container is a flexible layout since UFV only
//       supports updating flexible layouts.
const addNewContainers = (
  rootContainer: ContainerConfig,
  containersToAdd: ContainerConfig[]
): ContainerConfig => {
  const newContainers = containersToAdd.filter(
    (container) =>
      !rootContainer.children?.some((child) => container.id === child.id)
  );
  return {
    ...rootContainer,
    ...(rootContainer.type === ContainerType.FLEXIBLE_LAYOUT &&
    rootContainer.children !== undefined &&
    Array.isArray(rootContainer.children)
      ? {
          children: [...rootContainer.children, ...newContainers],
        }
      : {}),
  };
};

const useManagedState = (initialState: {
  container: ContainerConfig;
}): UseManagedStateReturnType => {
  const [container, setContainer] = useState<ContainerConfig>(
    initialState.container
  );

  const [interactionState, setInteractionState] = useState<InteractionState>({
    hoverId: undefined,
    clickedContainerReferenceId: undefined,
    selectedAnnotationId: undefined,
  });

  const { activeCanvas, saveCanvas } = useIndustryCanvasService();

  const { undo, redo, pushState, replaceState, historyState } = useHistory({
    saveState: async (state: IndustryCanvasState) => {
      if (activeCanvas !== undefined) {
        await saveCanvas({
          ...activeCanvas,
          data: { ...state },
        });
      }
    },
  });

  const canvasState = useMemo(() => {
    return historyState.history[historyState.index];
  }, [historyState]);

  useShamefullySyncContainerFromContainerReferences({
    containerReferences: canvasState.containerReferences,
    setContainer,
    setInteractionState,
  });

  // Initializing the state from local storage when the component mounts
  useEffect(() => {
    if (activeCanvas === undefined) {
      return;
    }
    replaceState(activeCanvas.data);
  }, [activeCanvas, replaceState]);

  const onUpdateRequest: UpdateHandlerFn = useCallback(
    ({ containers: updatedContainers, annotations: updatedAnnotations }) => {
      const { containerReferences, canvasAnnotations } = canvasState;
      const nextContainer = getNextUpdatedContainer(
        container,
        updatedContainers
      );
      const nextContainerReferences =
        getContainerReferencesWithUpdatedDimensions(
          containerReferences,
          nextContainer
        );
      const nextCanvasAnnotations = [
        ...canvasAnnotations.map((annotation) =>
          mergeIfMatchById(updatedAnnotations, annotation)
        ),
        ...updatedAnnotations.filter(
          (updatedAnnotation) =>
            !canvasAnnotations.some(
              (annotation) => annotation.id === updatedAnnotation.id
            )
        ),
      ];

      // We want the tooltip to show when creating an annotation
      if (updatedAnnotations.length === 1) {
        setInteractionState({
          clickedContainerReferenceId: undefined,
          hoverId: undefined,
          selectedAnnotationId: updatedAnnotations[0].id,
        });
      }

      setContainer(nextContainer);
      pushState({
        containerReferences: nextContainerReferences,
        canvasAnnotations: nextCanvasAnnotations,
      });
    },
    [canvasState, container, pushState]
  );

  const onDeleteRequest: DeleteHandlerFn = useCallback(
    ({ annotationIds, containerIds }) => {
      const { containerReferences, canvasAnnotations } = canvasState;

      const nextCanvasAnnotations = canvasAnnotations.filter(
        (annotation) =>
          !annotationIds.includes(annotation.id) &&
          containerIds.every(
            (containerId) =>
              !('containerId' in annotation) ||
              annotation?.containerId !== containerId
          )
      );

      const nextContainer = removeRecursive(container, (container) => {
        return (
          container.id !== undefined && containerIds.includes(container.id)
        );
      });

      const nextContainerReferences =
        getContainerReferencesWithUpdatedDimensions(
          containerReferences.filter(
            (cr) => !containerIds.includes(getContainerId(cr))
          ),
          nextContainer
        );

      setContainer(nextContainer);
      pushState({
        containerReferences: nextContainerReferences,
        canvasAnnotations: nextCanvasAnnotations,
      });
    },
    [setContainer, container, pushState, canvasState]
  );

  const removeContainerReference = (containerReference: ContainerReference) => {
    const { containerReferences, canvasAnnotations } = canvasState;
    const nextContainerReferences = containerReferences.filter(
      (cr) => cr.id !== containerReference.id
    );
    pushState({
      containerReferences: nextContainerReferences,
      canvasAnnotations,
    });
  };

  const addContainerReferences = (
    containerReferences: ContainerReference[]
  ) => {
    const { containerReferences: prevContainerReferences, canvasAnnotations } =
      canvasState;
    const nextContainerReferences = [
      ...prevContainerReferences,
      ...containerReferences,
    ];
    pushState({
      containerReferences: nextContainerReferences,
      canvasAnnotations,
    });
  };

  const updateContainerReference = (
    containerReferenceUpdate: ContainerReferenceWithoutDimensions
  ) => {
    const { containerReferences, canvasAnnotations } = canvasState;

    const nextContainerReferences = containerReferences.map(
      (containerReference) => {
        if (containerReference.id === containerReferenceUpdate.id) {
          return {
            ...containerReference,
            ...containerReferenceUpdate,
          } as ContainerReference;
        }
        return containerReference;
      }
    );

    pushState({
      containerReferences: nextContainerReferences,
      canvasAnnotations,
    });
  };

  return {
    container,
    canvasAnnotations: canvasState.canvasAnnotations,
    containerReferences: canvasState.containerReferences,
    addContainerReferences,
    updateContainerReference,
    removeContainerReference,
    onUpdateRequest,
    onDeleteRequest,
    interactionState,
    setInteractionState,
    undo,
    redo,
  };
};

export default useManagedState;
