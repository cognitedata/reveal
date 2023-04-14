import { useSDK } from '@cognite/sdk-provider';

import {
  ContainerConfig,
  ContainerType,
  UnifiedViewer,
  UnifiedViewerEventListenerMap,
  UnifiedViewerEventType,
  UnifiedViewerMouseEvent,
} from '@cognite/unified-file-viewer';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useIndustryCanvasContext } from '../IndustryCanvasContext';
import {
  CanvasAnnotation,
  ContainerReference,
  SerializedCanvasDocument,
  IndustryCanvasContainerConfig,
  IndustryCanvasState,
} from '../types';
import addDimensionsIfNotExists from '../utils/addDimensionsIfNotExists';
import {
  deserializeCanvasDocument,
  serializeCanvasState,
} from '../utils/utils';
import {
  UseCanvasStateHistoryReturnType,
  useHistory,
} from './useCanvasStateHistory';
import resolveContainerConfig from './utils/resolveContainerConfig';

export type InteractionState = {
  hoverId: string | undefined;
  clickedContainerId: string | undefined;
  selectedAnnotationId: string | undefined;
};

type UpdateHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_UPDATE_REQUEST];

type DeleteHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_DELETE_REQUEST];

export type UseManagedStateReturnType = {
  container: IndustryCanvasContainerConfig;
  canvasAnnotations: CanvasAnnotation[];
  addContainerReferences: (containerReference: ContainerReference[]) => void;
  onUpdateRequest: UpdateHandlerFn;
  onDeleteRequest: DeleteHandlerFn;
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  redo: UseCanvasStateHistoryReturnType['redo'];
  undo: UseCanvasStateHistoryReturnType['undo'];
  updateContainerById: (
    containerId: string,
    container: Partial<IndustryCanvasContainerConfig>
  ) => void;
  removeContainerById: (containerId: string) => void;
};

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

const removeRecursive = <T extends { id?: string; children?: T[] | undefined }>(
  container: T,
  shouldRemoveContainer: (fn: T) => boolean
): T => ({
  ...container,
  ...(container.children !== undefined && Array.isArray(container.children)
    ? {
        children: container.children
          .filter((child) => !shouldRemoveContainer(child))
          .map((child) => removeRecursive(child, shouldRemoveContainer)),
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

const getNextUpdatedContainer = (
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

const getNextUpdatedAnnotations = (
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

const useAutoSaveState = (
  canvasState: IndustryCanvasState,
  hasFinishedInitialLoad: boolean,
  activeCanvas: SerializedCanvasDocument | undefined,
  saveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>
) => {
  useEffect(() => {
    if (hasFinishedInitialLoad && activeCanvas !== undefined) {
      saveCanvas({
        ...activeCanvas,
        data: serializeCanvasState(canvasState),
      });
    }
    // activeCanvas will change with every save, so we don't want to include it in the dependency array
    // if included, it will lead to an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasState, saveCanvas, hasFinishedInitialLoad]);
};

const useAutoLoadState = (
  activeCanvas: SerializedCanvasDocument | undefined,
  replaceState: (state: IndustryCanvasState) => void
) => {
  const sdk = useSDK();
  const hasFinishedInitialLoad = useRef<boolean>(false);
  const activeCanvasExternalId = activeCanvas?.externalId;
  useEffect(() => {
    if (activeCanvasExternalId === undefined) {
      return;
    }
    hasFinishedInitialLoad.current = false;
  }, [activeCanvasExternalId]);

  useEffect(() => {
    if (activeCanvas === undefined || hasFinishedInitialLoad.current) {
      return;
    }
    (async () => {
      const deserializedCanvasDocument = await deserializeCanvasDocument(
        sdk,
        activeCanvas
      );
      replaceState(deserializedCanvasDocument.data);
      hasFinishedInitialLoad.current = true;
    })();
  }, [activeCanvas, replaceState, sdk]);

  return {
    hasFinishedInitialLoad: hasFinishedInitialLoad.current,
  };
};

const usePersistence = (
  canvasState: IndustryCanvasState,
  replaceState: (state: IndustryCanvasState) => void
) => {
  const { activeCanvas, saveCanvas } = useIndustryCanvasContext();
  const { hasFinishedInitialLoad } = useAutoLoadState(
    activeCanvas,
    replaceState
  );
  useAutoSaveState(
    canvasState,
    hasFinishedInitialLoad,
    activeCanvas,
    saveCanvas
  );
};

const useManagedState = (
  unifiedViewer: UnifiedViewer | null
): UseManagedStateReturnType => {
  const sdk = useSDK();
  const [interactionState, setInteractionState] = useState<InteractionState>({
    hoverId: undefined,
    clickedContainerId: undefined,
    selectedAnnotationId: undefined,
  });
  const { canvasState, undo, redo, pushState, replaceState } = useHistory();
  usePersistence(canvasState, replaceState);

  const onUpdateRequest: UpdateHandlerFn = useCallback(
    ({ containers: updatedContainers, annotations: updatedAnnotations }) =>
      pushState(({ container, canvasAnnotations }) => {
        // If there is only one annotation in the update set, select it
        if (updatedAnnotations.length === 1) {
          setInteractionState({
            clickedContainerId: undefined,
            hoverId: undefined,
            selectedAnnotationId: updatedAnnotations[0].id,
          });
        }

        return {
          container: getNextUpdatedContainer(container, updatedContainers),
          canvasAnnotations: getNextUpdatedAnnotations(
            canvasAnnotations,
            updatedAnnotations
          ),
        };
      }),
    [pushState]
  );

  const onDeleteRequest: DeleteHandlerFn = useCallback(
    ({ annotationIds, containerIds }) => {
      const { container, canvasAnnotations } = canvasState;

      const nextCanvasAnnotations = canvasAnnotations.filter(
        (annotation) =>
          !annotationIds.includes(annotation.id) &&
          containerIds.every(
            (containerId) =>
              !('containerId' in annotation) ||
              annotation?.containerId !== containerId
          )
      );

      const nextContainer = removeRecursive<IndustryCanvasContainerConfig>(
        container,
        (container) => {
          return (
            container.id !== undefined && containerIds.includes(container.id)
          );
        }
      );

      pushState({
        container: nextContainer,
        canvasAnnotations: nextCanvasAnnotations,
      });
    },
    [canvasState, pushState]
  );

  const attachContainerClickHandler = useCallback(
    (
      containerConfig: IndustryCanvasContainerConfig
    ): IndustryCanvasContainerConfig & {
      // TODO: Fix this. Row layout etc don't support adding click handlers.
      onClick: (e: UnifiedViewerMouseEvent) => void;
    } => ({
      ...containerConfig,
      onClick: (e: UnifiedViewerMouseEvent) => {
        e.cancelBubble = true;
        setInteractionState({
          hoverId: undefined,
          clickedContainerId: containerConfig.id,
          selectedAnnotationId: undefined,
        });
      },
    }),
    []
  );

  const addContainerReferences = useCallback(
    async (containerReferences: ContainerReference[]) => {
      if (unifiedViewer === null) {
        throw new Error('UnifiedViewer is not initialized');
      }

      return Promise.all(
        addDimensionsIfNotExists(unifiedViewer, containerReferences).map(
          async (containerReference) => {
            const containerConfig = await resolveContainerConfig(
              sdk,
              containerReference
            );

            pushState((prevState: IndustryCanvasState) => {
              return {
                ...prevState,
                container: {
                  ...prevState.container,
                  children: [
                    ...(prevState.container.children ?? []),
                    containerConfig,
                  ],
                },
              };
            });
          }
        )
      );
    },
    [unifiedViewer, sdk, pushState]
  );

  const removeContainerById = useCallback(
    (containerIdToRemove: string) => {
      pushState((prevState: IndustryCanvasState) => {
        return {
          ...prevState,
          container: {
            ...prevState.container,
            children: [
              ...(prevState.container.children ?? []).filter(
                (child) => containerIdToRemove !== child.id
              ),
            ],
          },
        };
      });
    },
    [pushState]
  );

  const updateContainerById = useCallback(
    async (
      containerId: string,
      containerConfig: Partial<IndustryCanvasContainerConfig>
    ) => {
      pushState((prevState: IndustryCanvasState) => ({
        ...prevState,
        container: {
          ...prevState.container,
          children: [
            ...(prevState.container.children ?? []).map((child) =>
              child.id === containerId
                ? ({
                    ...child,
                    ...containerConfig,
                  } as IndustryCanvasContainerConfig)
                : child
            ),
          ],
        },
      }));
    },
    [pushState]
  );

  const containerWithClickHandlers: IndustryCanvasContainerConfig =
    useMemo(() => {
      return {
        ...canvasState.container,
        children: canvasState.container.children?.map(
          attachContainerClickHandler
        ) as IndustryCanvasContainerConfig[],
      };
    }, [attachContainerClickHandler, canvasState.container]);

  return {
    container: containerWithClickHandlers,
    canvasAnnotations: canvasState.canvasAnnotations,
    addContainerReferences,
    removeContainerById,
    updateContainerById,
    onUpdateRequest,
    onDeleteRequest,
    interactionState,
    setInteractionState,
    undo,
    redo,
  };
};

export default useManagedState;
