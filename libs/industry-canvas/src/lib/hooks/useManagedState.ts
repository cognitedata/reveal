import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import debounce from 'lodash/debounce';

import { useSDK } from '@cognite/sdk-provider';
import {
  Annotation,
  ContainerConfig,
  ContainerType,
  IdsByType,
  isRectangleAnnotation,
  UnifiedViewer,
  UnifiedViewerEventListenerMap,
  UnifiedViewerEventType,
  UnifiedViewerMouseEvent,
} from '@cognite/unified-file-viewer';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { RuleType } from '../components/ContextualTooltips/AssetTooltip/types';
import {
  SHAMEFUL_WAIT_TO_ENSURE_ANNOTATIONS_ARE_RENDERED_MS,
  ZOOM_TO_FIT_MARGIN,
  ZOOM_DURATION_SECONDS,
  MetricEvent,
} from '../constants';
import { OnOpenConditionalFormattingClick } from '../IndustryCanvas';
import { useIndustryCanvasContext } from '../IndustryCanvasContext';
import { useCommentsUpsertMutation } from '../services/comments/hooks';
import { CommentTargetType } from '../services/comments/types';
import { getCdfUserFromUserProfile } from '../services/comments/utils';
import {
  CanvasAnnotation,
  ContainerReference,
  SerializedCanvasDocument,
  IndustryCanvasContainerConfig,
  IndustryCanvasState,
  IndustryCanvasToolType,
  COMMENT_METADATA_ID,
  isCommentAnnotation,
  SerializedIndustryCanvasState,
  isIndustryCanvasContainerConfig,
} from '../types';
import { useUserProfile } from '../UserProfileProvider';
import { deepEqualWithMissingProperties } from '../utils/deepEqualWithMissingProperties';
import { addDimensionsToContainerReferencesIfNotExists } from '../utils/dimensions';
import useMetrics from '../utils/tracking/useMetrics';
import {
  deserializeCanvasDocument,
  getRemovedIdsByType,
  serializeCanvasState,
} from '../utils/utils';

import {
  UseCanvasStateHistoryReturnType,
  useHistory,
} from './useCanvasStateHistory';
import { useContainerAnnotations } from './useContainerAnnotations';
import { UseManagedToolReturnType } from './useManagedTool';
import resolveContainerConfig from './utils/resolveContainerConfig';

export type InteractionState = {
  hoverId: string | undefined;
  clickedContainerAnnotationId: string | undefined;
};

type UpdateHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_UPDATE_REQUEST];

type DeleteHandlerFn =
  UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_DELETE_REQUEST];

export type OnLiveSensorRulesChange = ({
  annotationId,
  timeseriesId,
  rules,
}: {
  annotationId: string;
  timeseriesId: number;
  rules: RuleType[];
}) => void;

export type IsConditionalFormattingOpenByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, boolean>
>;

export type OnCloseConditionalFormattingClick = () => void;

export type LiveSensorRulesByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, RuleType[]>
>;

export type OnToggleConditionalFormatting = ({
  annotationId,
  timeseriesId,
}: {
  annotationId: string;
  timeseriesId: number;
}) => void;

export type UseManagedStateReturnType = {
  container: IndustryCanvasContainerConfig;
  canvasAnnotations: CanvasAnnotation[];
  addContainerReferences: (
    containerReference: ContainerReference[]
  ) => Promise<IndustryCanvasContainerConfig[]>;
  onUpdateRequest: UpdateHandlerFn;
  onDeleteRequest: DeleteHandlerFn;
  redo: UseCanvasStateHistoryReturnType['redo'];
  undo: UseCanvasStateHistoryReturnType['undo'];
  updateContainerById: (
    containerId: string,
    container: Partial<IndustryCanvasContainerConfig>
  ) => void;
  removeContainerById: (containerId: string) => void;
  interactionState: InteractionState;
  setInteractionState: Dispatch<SetStateAction<InteractionState>>;
  clickedContainerAnnotation: ExtendedAnnotation | undefined;
  containerAnnotations: ExtendedAnnotation[];
  pinnedTimeseriesIdsByAnnotationId: Record<string, number[]>;
  onPinTimeseriesClick: ({
    annotationId,
    timeseriesId,
  }: {
    annotationId: string;
    timeseriesId: number;
  }) => void;
  liveSensorRulesByAnnotationIdByTimeseriesId: LiveSensorRulesByAnnotationIdByTimeseriesId;
  onLiveSensorRulesChange: OnLiveSensorRulesChange;
  isConditionalFormattingOpenAnnotationIdByTimeseriesId: IsConditionalFormattingOpenByAnnotationIdByTimeseriesId;
  onOpenConditionalFormattingClick: OnOpenConditionalFormattingClick;
  onCloseConditionalFormattingClick: OnCloseConditionalFormattingClick;
  onToggleConditionalFormatting: OnToggleConditionalFormatting;
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

const SAVE_CANVAS_DEBOUNCE_TIME_MS = 700;
const debouncedSaveCanvas = debounce(
  async (
    activeCanvas: SerializedCanvasDocument,
    serializedData: SerializedIndustryCanvasState,
    saveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>,
    deleteCanvasIdsByType: ({
      ids,
      canvasExternalId,
    }: {
      ids: IdsByType;
      canvasExternalId: string;
    }) => Promise<void>
  ) => {
    // Delete the annotations and containers nodes that have been removed from the canvas
    await deleteCanvasIdsByType({
      canvasExternalId: activeCanvas.externalId,
      ids: getRemovedIdsByType(activeCanvas.data, serializedData),
    });
    await saveCanvas({
      ...activeCanvas,
      data: serializedData,
    });
  },
  SAVE_CANVAS_DEBOUNCE_TIME_MS
);

const useAutoSaveState = (
  canvasState: IndustryCanvasState,
  hasFinishedInitialLoad: boolean,
  activeCanvas: SerializedCanvasDocument | undefined,
  saveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>,
  deleteCanvasIdsByType: ({
    ids,
    canvasExternalId,
  }: {
    ids: IdsByType;
    canvasExternalId: string;
  }) => Promise<void>
) => {
  useEffect(() => {
    if (!hasFinishedInitialLoad || activeCanvas === undefined) {
      return;
    }
    const filteredCanvasAnnotations = canvasState.canvasAnnotations.filter(
      (annotation) => !isCommentAnnotation(annotation)
    );
    const serializedData = serializeCanvasState({
      ...canvasState,
      canvasAnnotations: filteredCanvasAnnotations,
    });
    if (deepEqualWithMissingProperties(serializedData, activeCanvas.data)) {
      return;
    }

    debouncedSaveCanvas(
      activeCanvas,
      serializedData,
      saveCanvas,
      deleteCanvasIdsByType
    );
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
  const { activeCanvas, saveCanvas, deleteCanvasIdsByType } =
    useIndustryCanvasContext();
  const { hasFinishedInitialLoad } = useAutoLoadState(
    activeCanvas,
    replaceState
  );
  useAutoSaveState(
    canvasState,
    hasFinishedInitialLoad,
    activeCanvas,
    saveCanvas,
    deleteCanvasIdsByType
  );
};

const useManagedState = ({
  unifiedViewer,
  toolType,
  setToolType,
}: {
  unifiedViewer: UnifiedViewer | null;
  toolType: UseManagedToolReturnType['toolType'];
  setToolType: UseManagedToolReturnType['setToolType'];
}): UseManagedStateReturnType => {
  const sdk = useSDK();
  const trackUsage = useMetrics();

  const [interactionState, setInteractionState] = useState<InteractionState>({
    hoverId: undefined,
    clickedContainerAnnotationId: undefined,
  });
  const { canvasState, undo, redo, pushState, replaceState } = useHistory();
  usePersistence(canvasState, replaceState);
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useUserProfile();
  const { mutateAsync: upsertComments } = useCommentsUpsertMutation();
  const onUpdateRequest: UpdateHandlerFn = useCallback(
    ({ containers: updatedContainers, annotations: updatedAnnotations }) => {
      const validUpdatedContainers = updatedContainers.filter(
        isIndustryCanvasContainerConfig
      );
      if (
        validUpdatedContainers.length === 0 &&
        updatedAnnotations.length === 0
      ) {
        return;
      }

      pushState(
        ({
          container,
          canvasAnnotations,
          pinnedTimeseriesIdsByAnnotationId,
          liveSensorRulesByAnnotationIdByTimeseriesId,
        }) => {
          const updatedAnnotation = updatedAnnotations[0];
          const hasAnnotationBeenCreated =
            updatedAnnotation !== undefined &&
            updatedAnnotations.length === 1 &&
            !canvasAnnotations.some(
              (canvasAnnotation) => canvasAnnotation.id === updatedAnnotation.id
            );

          if (hasAnnotationBeenCreated) {
            // Augment the annotation with the comment metadata if the tool is comment
            if (toolType === IndustryCanvasToolType.COMMENT) {
              updatedAnnotation.isSelectable = false;
              updatedAnnotation.metadata = {
                ...updatedAnnotation.metadata,
                [COMMENT_METADATA_ID]: true,
              };

              if (!isRectangleAnnotation(updatedAnnotation)) {
                throw new Error(
                  'Provided annotation is not rectangle annotation'
                );
              }

              upsertComments([
                {
                  targetId: searchParams.get('canvasId') ?? undefined,
                  targetType: CommentTargetType.CANVAS,
                  createdBy: getCdfUserFromUserProfile(userProfile),
                  text: '',
                  externalId: updatedAnnotation.id,
                  targetContext: {
                    x: updatedAnnotation.x,
                    y: updatedAnnotation.y,
                  },
                },
              ]).then(() => {
                setSearchParams((currentParams) => {
                  currentParams.set('commentTooltipId', updatedAnnotation.id);
                  return currentParams;
                });
              });
            }

            setInteractionState({
              hoverId: undefined,
              clickedContainerAnnotationId: updatedAnnotation.id,
            });
            setToolType(IndustryCanvasToolType.SELECT);

            unifiedViewer?.once(UnifiedViewerEventType.ON_TOOL_CHANGE, () => {
              // It takes a little bit of time before the annotation is added, hence the timeout.
              // TODO: This is somewhat brittle and hacky. We should find a better way to do this.
              if (!isCommentAnnotation(updatedAnnotation)) {
                setTimeout(() => {
                  unifiedViewer?.selectByIds({
                    annotationIds: [updatedAnnotation.id],
                    containerIds: [],
                  });
                }, SHAMEFUL_WAIT_TO_ENSURE_ANNOTATIONS_ARE_RENDERED_MS);
              }
            });

            trackUsage(MetricEvent.ANNOTATION_CREATED, {
              annotationType: updatedAnnotation.type,
            });
          }

          return {
            container: getNextUpdatedContainer(
              container,
              validUpdatedContainers
            ),
            canvasAnnotations: getNextUpdatedAnnotations(
              canvasAnnotations,
              updatedAnnotations
            ),
            pinnedTimeseriesIdsByAnnotationId,
            liveSensorRulesByAnnotationIdByTimeseriesId,
          };
        }
      );
    },
    [
      pushState,
      toolType,
      setToolType,
      unifiedViewer,
      trackUsage,
      upsertComments,
      searchParams,
      userProfile,
      setSearchParams,
    ]
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
        ...canvasState,
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
          clickedContainerAnnotationId: undefined,
        });

        if (e.evt.altKey) {
          unifiedViewer?.zoomToContainerById(containerConfig.id, {
            relativeMargin: ZOOM_TO_FIT_MARGIN,
            duration: ZOOM_DURATION_SECONDS,
          });
        }
      },
    }),
    [unifiedViewer]
  );

  const addContainerReferences = useCallback(
    async (containerReferences: ContainerReference[]) => {
      if (unifiedViewer === null) {
        throw new Error('UnifiedViewer is not initialized');
      }

      return Promise.all(
        addDimensionsToContainerReferencesIfNotExists(
          containerReferences,
          serializeCanvasState(canvasState)
        ).map(async (containerReference) => {
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

          return containerConfig;
        })
      );
    },
    [unifiedViewer, sdk, pushState, canvasState]
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

  const onClickContainerAnnotation = useCallback(
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
    [setInteractionState, trackUsage]
  );

  const onMouseOverContainerAnnotation = useCallback(
    (annotation: Annotation) => {
      setInteractionState((prevInteractionState) => ({
        ...prevInteractionState,
        hoverId: annotation.id,
      }));
    },
    [setInteractionState]
  );

  const onMouseOutContainerAnnotation = useCallback(() => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: undefined,
    }));
  }, [setInteractionState]);

  const containerAnnotations = useContainerAnnotations({
    container: containerWithClickHandlers,
    selectedAnnotationId: interactionState.clickedContainerAnnotationId,
    hoverId: interactionState.hoverId,
    onClick: onClickContainerAnnotation,
    onMouseOver: onMouseOverContainerAnnotation,
    onMouseOut: onMouseOutContainerAnnotation,
  });

  const clickedContainerAnnotation = useMemo(
    () =>
      containerAnnotations.find(
        (annotation) =>
          annotation.id === interactionState.clickedContainerAnnotationId
      ),
    [containerAnnotations, interactionState.clickedContainerAnnotationId]
  );

  const [
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    setIsConditionalFormattingOpenByAnnotationIdByTimeseriesId,
  ] = React.useState<IsConditionalFormattingOpenByAnnotationIdByTimeseriesId>(
    {}
  );

  const onOpenConditionalFormattingClick: OnOpenConditionalFormattingClick =
    useCallback(
      ({ annotationId, timeseriesId }) => {
        setIsConditionalFormattingOpenByAnnotationIdByTimeseriesId({
          [annotationId]: { [timeseriesId]: true },
        });

        // Kind of hacky, but using this to close the other popover.
        // Will get fixed in the near future when we refactor the state
        setInteractionState({
          hoverId: undefined,
          clickedContainerAnnotationId: undefined,
        });
      },
      [setInteractionState]
    );

  const onCloseConditionalFormattingClick: OnCloseConditionalFormattingClick =
    useCallback(() => {
      setIsConditionalFormattingOpenByAnnotationIdByTimeseriesId({});
    }, []);

  useEffect(() => {
    if (interactionState.clickedContainerAnnotationId !== undefined) {
      // Again hacky side-effect, will be fixed when refactoring the state
      onCloseConditionalFormattingClick();
    }
  }, [interactionState]);

  const onPinTimeseriesClick = useCallback(
    ({
      annotationId,
      timeseriesId,
    }: {
      annotationId: string;
      timeseriesId: number;
    }) => {
      const wasPinned =
        canvasState.pinnedTimeseriesIdsByAnnotationId[annotationId]?.includes(
          timeseriesId
        );

      if (!wasPinned) {
        // Shameful, will also be fixed when refactoring the state.
        // Essentially we want to modify two pieces of state in the same place
        onOpenConditionalFormattingClick({
          annotationId,
          timeseriesId,
        });
      }

      pushState((prevState) => ({
        ...prevState,
        pinnedTimeseriesIdsByAnnotationId: {
          ...prevState.pinnedTimeseriesIdsByAnnotationId,
          [annotationId]: wasPinned ? [] : [timeseriesId],
        },
      }));
    },
    [canvasState.pinnedTimeseriesIdsByAnnotationId, pushState]
  );

  const onLiveSensorRulesChange: OnLiveSensorRulesChange = useCallback(
    ({
      annotationId,
      timeseriesId,
      rules,
    }: {
      annotationId: string;
      timeseriesId: number;
      rules: RuleType[];
    }) => {
      pushState((prevState) => ({
        ...prevState,
        liveSensorRulesByAnnotationIdByTimeseriesId: {
          ...prevState.liveSensorRulesByAnnotationIdByTimeseriesId,
          [annotationId]: {
            ...prevState.liveSensorRulesByAnnotationIdByTimeseriesId[
              annotationId
            ],
            [timeseriesId]: rules,
          },
        },
      }));
    },
    [pushState]
  );

  const onToggleConditionalFormatting: OnToggleConditionalFormatting =
    useCallback(
      ({ annotationId, timeseriesId }) =>
        setIsConditionalFormattingOpenByAnnotationIdByTimeseriesId(
          (prevState) => {
            if (prevState[annotationId]?.[timeseriesId] !== undefined) {
              return {};
            }

            setInteractionState({
              hoverId: undefined,
              clickedContainerAnnotationId: undefined,
            });

            return {
              // NOTE: Intentionally only one
              [annotationId]: { [timeseriesId]: true },
            };
          }
        ),
      []
    );

  return {
    container: containerWithClickHandlers,
    canvasAnnotations: canvasState.canvasAnnotations,
    addContainerReferences,
    removeContainerById,
    updateContainerById,
    onUpdateRequest,
    onDeleteRequest,
    undo,
    redo,
    interactionState,
    setInteractionState,
    clickedContainerAnnotation,
    containerAnnotations,
    pinnedTimeseriesIdsByAnnotationId:
      canvasState.pinnedTimeseriesIdsByAnnotationId,
    onPinTimeseriesClick,
    liveSensorRulesByAnnotationIdByTimeseriesId:
      canvasState.liveSensorRulesByAnnotationIdByTimeseriesId,
    onLiveSensorRulesChange,
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    onOpenConditionalFormattingClick,
    onCloseConditionalFormattingClick,
    onToggleConditionalFormatting,
  };
};

export default useManagedState;
