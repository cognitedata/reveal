import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Annotation,
  ContainerType,
  ContainerConfig,
  UnifiedViewerEventListenerMap,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';
import {
  loadCanvasState,
  getContainerId,
  getContainerReferencesWithUpdatedDimensions,
  saveCanvasState,
} from '../utils/utils';
import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceWithoutDimensions,
} from '../types';

type UpdateHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_UPDATE_REQUEST];

type DeleteHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_DELETE_REQUEST];

export type UseManagedStateReturnType = {
  container: ContainerConfig;
  setContainer: Dispatch<SetStateAction<ContainerConfig>>;
  canvasAnnotations: CanvasAnnotation[];
  setCanvasAnnotations: Dispatch<SetStateAction<CanvasAnnotation[]>>;
  containerReferences: ContainerReference[];
  addContainerReferences: (containerReference: ContainerReference[]) => void;
  updateContainerReference: (
    containerReference: ContainerReferenceWithoutDimensions
  ) => void;
  removeContainerReference: (containerReference: ContainerReference) => void;
  onUpdateRequest: UpdateHandlerFn;
  onDeleteRequest: DeleteHandlerFn;
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
  const [canvasAnnotations, setCanvasAnnotations] = useState<Annotation[]>([]);
  const [containerReferences, setContainerReferences] = useState<
    ContainerReference[]
  >([]);

  const onUpdateRequest: UpdateHandlerFn = useCallback(
    ({ containers: updatedContainers, annotations: updatedAnnotations }) => {
      setContainer((prevContainer) => {
        const containerWithNewContainersIfNecessary = addNewContainers(
          prevContainer,
          updatedContainers
        );
        // Update the existing container(s) if necessary
        const updatedContainer = transformRecursive(
          containerWithNewContainersIfNecessary,
          (container) => mergeIfMatchById(updatedContainers, container)
        );

        setContainerReferences(
          getContainerReferencesWithUpdatedDimensions(
            containerReferences,
            updatedContainer
          )
        );

        return updatedContainer;
      });

      setCanvasAnnotations((annotations) => {
        const annotationsToAdd = updatedAnnotations.filter(
          (updatedAnnotation) =>
            !annotations.some(
              (annotation) => annotation.id === updatedAnnotation.id
            )
        );

        return [
          ...annotations.map((annotation) =>
            mergeIfMatchById(updatedAnnotations, annotation)
          ),
          ...annotationsToAdd,
        ];
      });
    },
    [
      setContainer,
      setContainerReferences,
      containerReferences,
      setCanvasAnnotations,
    ]
  );

  const onDeleteRequest: DeleteHandlerFn = useCallback(
    ({ annotationIds, containerIds }) => {
      setCanvasAnnotations((annotations) =>
        annotations.filter(
          (annotation) =>
            !annotationIds.includes(annotation.id) &&
            containerIds.every(
              (containerId) =>
                !('containerId' in annotation) ||
                annotation?.containerId !== containerId
            )
        )
      );
      setContainer((prevContainer) => {
        const updatedContainer = removeRecursive(prevContainer, (container) => {
          return (
            container.id !== undefined && containerIds.includes(container.id)
          );
        });

        const containerReferencesRemoveOld = containerReferences.filter(
          (cr) => !containerIds.includes(getContainerId(cr))
        );
        setContainerReferences(
          getContainerReferencesWithUpdatedDimensions(
            containerReferencesRemoveOld,
            updatedContainer
          )
        );

        return updatedContainer;
      });
    },
    [setContainer, setContainerReferences, containerReferences]
  );

  const removeContainerReference = (containerReference: ContainerReference) => {
    setContainerReferences((prevContainerReferences) =>
      prevContainerReferences.filter((cr) => cr.id !== containerReference.id)
    );
  };

  const updateContainerReference = (
    containerReferenceUpdate: ContainerReferenceWithoutDimensions
  ) => {
    setContainerReferences((prevContainerReferences) =>
      prevContainerReferences.map((containerReference) => {
        if (containerReference.id === containerReferenceUpdate.id) {
          return {
            ...containerReference,
            ...containerReferenceUpdate,
          } as ContainerReference;
        }
        return containerReference;
      })
    );
  };

  // Initializing the state from local storage when the component mounts
  useEffect(() => {
    const canvasState = loadCanvasState();
    if (canvasState === null) {
      return;
    }

    setCanvasAnnotations((prevCanvasAnnotations) => [
      ...prevCanvasAnnotations,
      ...canvasState.canvasAnnotations,
    ]);

    setContainerReferences((prevContainerReferences) => [
      ...prevContainerReferences,
      ...canvasState.containerReferences,
    ]);
  }, [setCanvasAnnotations, setContainerReferences]);

  useEffect(() => {
    saveCanvasState({
      containerReferences,
      canvasAnnotations,
    });
  }, [containerReferences, canvasAnnotations]);

  return {
    container,
    setContainer,
    canvasAnnotations,
    setCanvasAnnotations,
    containerReferences,
    addContainerReferences: (containerReferences) => {
      setContainerReferences((prevContainerReferences) => [
        ...prevContainerReferences,
        ...containerReferences,
      ]);
    },
    updateContainerReference,
    removeContainerReference,
    onUpdateRequest,
    onDeleteRequest,
  };
};

export default useManagedState;
