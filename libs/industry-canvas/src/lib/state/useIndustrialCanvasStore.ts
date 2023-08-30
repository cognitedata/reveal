import { useSearchParams } from 'react-router-dom';

import { create } from 'zustand';

import { CogniteClient } from '@cognite/sdk/dist/src';
import {
  Annotation,
  ContainerConfig,
  EllipseToolConfig,
  IdsByType,
  ImageContainerProps,
  isRectangleAnnotation,
  LineToolConfig,
  PanToolConfig,
  RectangleToolConfig,
  SelectToolConfig,
  StickyToolConfig,
  TextToolConfig,
  ToolType,
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';

import {
  ResourceItem,
  ResourceSelectorFilter,
  ResourceType,
} from '@data-exploration-lib/core';

import {
  SHAPE_ANNOTATION_FILL_COLOR_MAP,
  SHAPE_ANNOTATION_STROKE_COLOR_MAP,
  STICKY_ANNOTATION_COLOR_MAP,
  TEXT_ANNOTATION_COLOR_MAP,
} from '../colors';
import { RuleType } from '../components/ContextualTooltips/AssetTooltip/types';
import { FileUploadData } from '../components/IndustryCanvasFileUploadModal/IndustryCanvasFileUploadModal';
import {
  DEFAULT_FONT_SIZE,
  MetricEvent,
  SHAMEFUL_WAIT_TO_ENSURE_ANNOTATIONS_ARE_RENDERED_MS,
} from '../constants';
import { EMPTY_FLEXIBLE_LAYOUT } from '../hooks/constants';
import {
  getNextUpdatedAnnotations,
  getNextUpdatedContainer,
  InteractionState,
} from '../hooks/useOnUpdateRequest';
import resolveContainerConfig from '../hooks/utils/resolveContainerConfig';
import { useCommentsUpsertMutation } from '../services/comments/hooks/index';
import { CommentTargetType } from '../services/comments/types';
import { getCdfUserFromUserProfile } from '../services/comments/utils';
import {
  COMMENT_METADATA_ID,
  ContainerReference,
  IndustryCanvasContainerConfig,
  IndustryCanvasState,
  IndustryCanvasToolType,
  isCommentAnnotation,
  isIndustryCanvasContainerConfig,
} from '../types';
import { UserProfile } from '../UserProfileProvider';
import { dataUrlToFile, isPastedImageContainer } from '../utils/dataUrlUtils';
import { addDimensionsToContainerReferencesIfNotExists } from '../utils/dimensions/index';
import { TrackUsageFn } from '../utils/tracking/createTrackUsage';
import { serializeCanvasState } from '../utils/utils';

import removeRecursive from './removeRecursive';

export type HistoryState = {
  history: IndustryCanvasState[];
  index: number;
};

export type ToolConfigByType = {
  [IndustryCanvasToolType.RECTANGLE]: RectangleToolConfig;
  [IndustryCanvasToolType.ELLIPSE]: EllipseToolConfig;
  [IndustryCanvasToolType.TEXT]: TextToolConfig;
  [IndustryCanvasToolType.SELECT]: SelectToolConfig;
  [IndustryCanvasToolType.PAN]: PanToolConfig;
  [IndustryCanvasToolType.LINE]: LineToolConfig;
  [IndustryCanvasToolType.STICKY]: StickyToolConfig;
  [IndustryCanvasToolType.COMMENT]: {
    type: ToolType.RECTANGLE;
    fill: 'transparent';
    stroke: 'transparent';
    isWorkspaceAnnotation: true;
  };
};

const DEFAULT_STYLE = {
  fill: SHAPE_ANNOTATION_FILL_COLOR_MAP.BLUE,
  stroke: SHAPE_ANNOTATION_STROKE_COLOR_MAP.BLUE,
  strokeWidth: 3,
  isWorkspaceAnnotation: true,
};

export const SHARED_STICKY_TOOL_OPTIONS = {
  width: 200,
  height: 200,
  padding: 4,
  borderRadius: 4,
  borderWidth: 2,
  lineHeight: 1.2,
  shadowColor: 'rgba(79, 82, 104, 0.1)',
  shadowOffset: {
    x: 0,
    y: 1,
  },
  shadowBlur: 16,
  fontSize: '14px',
  backgroundColor: STICKY_ANNOTATION_COLOR_MAP.YELLOW,
  color: 'black',
  borderColor: 'rgba(83, 88, 127, 0.24)',
} satisfies Omit<StickyToolConfig, 'type'>;

const initialToolConfigsByType: ToolConfigByType = {
  [IndustryCanvasToolType.RECTANGLE]: {
    type: ToolType.RECTANGLE,
    ...DEFAULT_STYLE,
  },
  [IndustryCanvasToolType.ELLIPSE]: {
    type: ToolType.ELLIPSE,
    ...DEFAULT_STYLE,
  },
  [IndustryCanvasToolType.TEXT]: {
    type: ToolType.TEXT,
    fontSize: DEFAULT_FONT_SIZE,
    fill: TEXT_ANNOTATION_COLOR_MAP.BLACK,
    isWorkspaceAnnotation: true,
  },
  [IndustryCanvasToolType.SELECT]: { type: ToolType.SELECT },
  [IndustryCanvasToolType.PAN]: { type: ToolType.PAN },
  [IndustryCanvasToolType.LINE]: {
    type: ToolType.LINE,
    ...DEFAULT_STYLE,
    shouldGenerateConnections: true,
  },
  [IndustryCanvasToolType.STICKY]: {
    type: ToolType.STICKY,
    ...SHARED_STICKY_TOOL_OPTIONS,
  },
  [IndustryCanvasToolType.COMMENT]: {
    type: ToolType.RECTANGLE,
    fill: 'transparent',
    stroke: 'transparent',
    isWorkspaceAnnotation: true,
  },
};

export type ResourceSelectorPropsType = {
  // Opens the resource selector with the given resource selected (open in the details view).
  initialSelectedResourceItem?: ResourceItem;

  // Opens the resource selector with the given filter applied.
  initialFilter?: ResourceSelectorFilter;

  // Opens the resource selector with the given tab selected.
  initialTab?: ResourceType;
  shouldOnlyShowPreviewPane?: boolean;
};

export type IsConditionalFormattingOpenByAnnotationIdByTimeseriesId = Record<
  string,
  Record<number, boolean>
>;

export type RootState = {
  interactionState: InteractionState;
  historyState: HistoryState;
  toolType: IndustryCanvasToolType;
  toolConfigByType: ToolConfigByType;
  shouldShowConnectionAnnotations: boolean;
  isResourceSelectorOpen: boolean;
  isCommentsPaneOpen: boolean;
  isFileUploadModalOpen: boolean;
  resourceSelectorProps: ResourceSelectorPropsType | undefined;
  currentZoomScale: number;
  isConditionalFormattingOpenAnnotationIdByTimeseriesId: IsConditionalFormattingOpenByAnnotationIdByTimeseriesId;
  selectedIdsByType: IdsByType;
  fileUploadData: FileUploadData | null;
};

const initialState: RootState = {
  interactionState: {
    hoverId: undefined,
    clickedContainerAnnotationId: undefined,
  },
  // Keeping the naming for now, will refactor later.
  historyState: {
    history: [
      {
        container: EMPTY_FLEXIBLE_LAYOUT,
        canvasAnnotations: [],
        pinnedTimeseriesIdsByAnnotationId: {},
        liveSensorRulesByAnnotationIdByTimeseriesId: {},
      },
    ],
    index: 0,
  },
  toolType: IndustryCanvasToolType.SELECT,
  toolConfigByType: initialToolConfigsByType,
  shouldShowConnectionAnnotations: true,
  isResourceSelectorOpen: false,
  isCommentsPaneOpen: false,
  isFileUploadModalOpen: false,
  resourceSelectorProps: undefined,
  currentZoomScale: 1,
  isConditionalFormattingOpenAnnotationIdByTimeseriesId: {},
  selectedIdsByType: {
    annotationIds: [],
    containerIds: [],
  },
  fileUploadData: null,
};

export const useIndustrialCanvasStore = create<RootState>(() => initialState);

export const setIsFileUploadModalOpen = (isFileUploadModalOpen: boolean) => {
  useIndustrialCanvasStore.setState((prevState) => ({
    ...prevState,
    isFileUploadModalOpen,
  }));
};

export const setFileUploadData = (fileUploadData: FileUploadData | null) => {
  useIndustrialCanvasStore.setState((prevState) => ({
    ...prevState,
    fileUploadData,
  }));
};

export const setSelectedIdsByType = (selectedIdsByType: IdsByType) => {
  useIndustrialCanvasStore.setState((prevState) => ({
    ...prevState,
    selectedIdsByType,
  }));
};

export const onLiveSensorRulesChangeByAnnotationIdByTimeseriesIds = ({
  annotationId,
  timeseriesId,
  rules,
}: {
  annotationId: string;
  timeseriesId: number;
  rules: RuleType[];
}) => {
  pushHistoryState((prevState: IndustryCanvasState) => ({
    ...prevState,
    liveSensorRulesByAnnotationIdByTimeseriesId: {
      ...prevState.liveSensorRulesByAnnotationIdByTimeseriesId,
      [annotationId]: {
        ...prevState.liveSensorRulesByAnnotationIdByTimeseriesId[annotationId],
        [timeseriesId]: rules,
      },
    },
  }));
};

export const onToggleConditionalFormattingClick = ({
  annotationId,
  timeseriesId,
}: {
  annotationId: string;
  timeseriesId: number;
}) => {
  useIndustrialCanvasStore.setState((prevState) => {
    const isConditionalFormattingOpen =
      prevState.isConditionalFormattingOpenAnnotationIdByTimeseriesId[
        annotationId
      ]?.[timeseriesId] ?? false;
    return {
      ...prevState,
      ...applyConditionalFormattingClickTransform(prevState, {
        annotationId,
        timeseriesId,
        shouldBeOpen: !isConditionalFormattingOpen,
      }),
    };
  });
};

const applyConditionalFormattingClickTransform = (
  state: RootState,
  {
    annotationId,
    timeseriesId,
    shouldBeOpen,
  }: {
    annotationId: string;
    timeseriesId: number;
    shouldBeOpen: boolean;
  }
) => {
  return {
    ...state,
    interactionState: shouldBeOpen
      ? {
          ...state.interactionState,
          hoverId: undefined,
          clickedContainerAnnotationId: undefined,
        }
      : state.interactionState,
    isConditionalFormattingOpenAnnotationIdByTimeseriesId: {
      ...state.isConditionalFormattingOpenAnnotationIdByTimeseriesId,
      [annotationId]: {
        ...state.isConditionalFormattingOpenAnnotationIdByTimeseriesId[
          annotationId
        ],
        [timeseriesId]: shouldBeOpen,
      },
    },
  };
};

export const onPinTimeseriesClick = ({
  annotationId,
  timeseriesId,
}: {
  annotationId: string;
  timeseriesId: number;
}) => {
  pushHistoryState((prevState: IndustryCanvasState) => {
    const wasPinned =
      prevState.pinnedTimeseriesIdsByAnnotationId[annotationId]?.includes(
        timeseriesId
      );

    setImmediate(() => {
      useIndustrialCanvasStore.setState((prevState) => ({
        ...(wasPinned
          ? {}
          : applyConditionalFormattingClickTransform(prevState, {
              annotationId,
              timeseriesId,
              shouldBeOpen: true,
            })),
      }));
    });

    return {
      ...prevState,
      pinnedTimeseriesIdsByAnnotationId: {
        ...prevState.pinnedTimeseriesIdsByAnnotationId,
        [annotationId]: wasPinned ? [] : [timeseriesId],
      },
    };
  });
};

export const openConditionalFormattingClick = ({
  annotationId,
  timeseriesId,
}: {
  annotationId: string;
  timeseriesId: number;
}) => {
  useIndustrialCanvasStore.setState((prevState) =>
    applyConditionalFormattingClickTransform(prevState, {
      annotationId,
      timeseriesId,
      shouldBeOpen: true,
    })
  );
};

export const closeConditionalFormattingClick = () => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      isConditionalFormattingOpenAnnotationIdByTimeseriesId: {},
    };
  });
};

const applyDeleteRequestTransform = (
  { container, canvasAnnotations, ...otherState }: IndustryCanvasState,
  { annotationIds, containerIds }: IdsByType
) => {
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
      return container.id !== undefined && containerIds.includes(container.id);
    }
  );

  // TODO: Missing deleting pinned timeseries ids here if the annotation is deleted
  return {
    ...otherState,
    container: nextContainer,
    canvasAnnotations: nextCanvasAnnotations,
  };
};

// TODO: Extract this to its own module
export const selectors: {
  canvasState: (state: RootState) => IndustryCanvasState;
  isUndoAvailable: (state: RootState) => boolean;
  isRedoAvailable: (state: RootState) => boolean;
} = {
  canvasState: (state: RootState) =>
    state.historyState.history[state.historyState.index],
  isUndoAvailable: (state: RootState) => state.historyState.index > 0,
  isRedoAvailable: (state: RootState) =>
    state.historyState.index < state.historyState.history.length - 1,
};

export const addContainerReferences = ({
  sdk,
  unifiedViewer,
  containerReferences,
}: {
  sdk: CogniteClient;
  unifiedViewer: UnifiedViewer | null;
  containerReferences: ContainerReference[];
}) => {
  if (unifiedViewer === null) {
    throw new Error('UnifiedViewer is not initialized');
  }

  return Promise.all(
    addDimensionsToContainerReferencesIfNotExists(
      containerReferences,
      serializeCanvasState(
        selectors.canvasState(useIndustrialCanvasStore.getState())
      )
    ).map(async (containerReference) => {
      const containerConfig = await resolveContainerConfig(
        sdk,
        containerReference
      );

      return addContainerConfig({
        containerConfig,
      });
    })
  );
};

export const addContainerConfig = ({
  containerConfig,
}: {
  containerConfig: IndustryCanvasContainerConfig;
}) => {
  pushHistoryState((prevState: IndustryCanvasState) => ({
    ...prevState,
    container: {
      ...prevState.container,
      children: [
        ...(prevState.container.children ?? []),
        {
          ...containerConfig,
        },
      ],
    },
  }));
  return containerConfig;
};

export const updateContainerById = ({
  containerId,
  containerConfig,
}: {
  containerId: string;
  containerConfig: IndustryCanvasContainerConfig;
}) => {
  pushHistoryState((prevState: IndustryCanvasState) => ({
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
};

const setFileUploadDataFromPastedImageContainer = (
  container: ImageContainerProps
): void => {
  if (container?.x === undefined || container?.y === undefined) {
    return;
  }
  const { x, y, url } = container;
  const screenshotFilename = `Screenshot_${new Date().toISOString()}`;
  dataUrlToFile(url, screenshotFilename).then((file) => {
    setFileUploadData({ file, relativePointerPosition: { x, y } });
  });
};

// Shameful: This is doing way too many things, and doing so imperatively, let's clean this up
// - Persisting of comments should happen as a side effect, not imperatively here.
// - The search params should be updated as a side effect, not imperatively here.
// - Selection should be owned by the application, not the canvas.
// - Tracking of annotation creation should be done as a side effect, not imperatively here.
export const shamefulOnUpdateRequest = ({
  containers: updatedContainers,
  annotations: updatedAnnotations,
  trackUsage,
  unifiedViewer,
  upsertComments,
  searchParams,
  setSearchParams,
  userProfile,
}: {
  containers: ContainerConfig[];
  annotations: Annotation[];
  trackUsage: TrackUsageFn;
  unifiedViewer: UnifiedViewer | null;
  upsertComments: ReturnType<typeof useCommentsUpsertMutation>['mutateAsync'];
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
  userProfile: UserProfile;
}) => {
  const rootState = useIndustrialCanvasStore.getState();

  const pastedImageContainers = updatedContainers.filter(
    isPastedImageContainer
  );
  if (pastedImageContainers.length === 1) {
    setFileUploadDataFromPastedImageContainer(pastedImageContainers[0]);
  }

  const validUpdatedContainers = updatedContainers.filter(
    isIndustryCanvasContainerConfig
  );
  if (validUpdatedContainers.length === 0 && updatedAnnotations.length === 0) {
    return;
  }

  const toolType = rootState.toolType;

  pushHistoryState(({ container, canvasAnnotations, ...otherState }) => {
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
          throw new Error('Provided annotation is not rectangle annotation');
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

      // Seem to be a race condition here where the tool type is being overwritten with it's old value, hence the setTimeout
      setTimeout(() => setToolType(IndustryCanvasToolType.SELECT));

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
      ...otherState,
      container: getNextUpdatedContainer(container, validUpdatedContainers),
      canvasAnnotations: getNextUpdatedAnnotations(
        canvasAnnotations,
        updatedAnnotations
      ),
    };
  });
};

export const onDeleteRequest = ({ annotationIds, containerIds }: IdsByType) => {
  setInteractionState({
    hoverId: undefined,
    clickedContainerAnnotationId: undefined,
  });
  pushHistoryState((state) =>
    applyDeleteRequestTransform(state, {
      annotationIds,
      containerIds,
    })
  );
};

export const setCurrentZoomScale = (zoomScale: number) => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      currentZoomScale: zoomScale,
    };
  });
};

export const closeCommentsPane = () => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      isCommentsPaneOpen: false,
    };
  });
};

export const toggleCommentsPane = () => {
  useIndustrialCanvasStore.setState((prevState) => {
    const nextIsCommentsPaneOpen = !prevState.isCommentsPaneOpen;
    return {
      ...prevState,
      isResourceSelectorOpen: nextIsCommentsPaneOpen
        ? false
        : prevState.isResourceSelectorOpen,
      isCommentsPaneOpen: nextIsCommentsPaneOpen,
    };
  });
};

export const openResourceSelector = (props?: ResourceSelectorPropsType) => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      isResourceSelectorOpen: true,
      isCommentsPaneOpen: false,
      resourceSelectorProps: props,
    };
  });
};

export const closeResourceSelector = () => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      isResourceSelectorOpen: false,
    };
  });
};

export const setShouldShowConnectionAnnotations = (
  stateOrUpdateFn:
    | boolean
    | ((prevShouldShowConnectionAnnotations: boolean) => boolean)
) => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      shouldShowConnectionAnnotations:
        typeof stateOrUpdateFn === 'function'
          ? stateOrUpdateFn(prevState.shouldShowConnectionAnnotations)
          : stateOrUpdateFn,
    };
  });
};

export const setToolType = (
  stateOrUpdateFn:
    | IndustryCanvasToolType
    | ((prevToolType: IndustryCanvasToolType) => IndustryCanvasToolType)
) => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      toolType:
        typeof stateOrUpdateFn === 'function'
          ? stateOrUpdateFn(prevState.toolType)
          : stateOrUpdateFn,
    };
  });
};

export const setToolConfigByType = (
  stateOrUpdateFn:
    | ToolConfigByType
    | ((prevToolConfigByType: ToolConfigByType) => ToolConfigByType)
) => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      toolConfigByType:
        typeof stateOrUpdateFn === 'function'
          ? stateOrUpdateFn(prevState.toolConfigByType)
          : stateOrUpdateFn,
    };
  });
};

export const setInteractionState = (
  stateOrUpdateFn:
    | InteractionState
    | ((prevInteractionState: InteractionState) => InteractionState)
) => {
  useIndustrialCanvasStore.setState((prevState) => {
    const nextInteractionState =
      typeof stateOrUpdateFn === 'function'
        ? stateOrUpdateFn(prevState.interactionState)
        : stateOrUpdateFn;
    return {
      ...prevState,
      interactionState: nextInteractionState,
      isConditionalFormattingOpenAnnotationIdByTimeseriesId:
        nextInteractionState.clickedContainerAnnotationId !== undefined
          ? {}
          : prevState.isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    };
  });
};

export const setHistoryState = (
  stateOrUpdateFn:
    | HistoryState
    | ((prevHistoryState: HistoryState) => HistoryState)
) => {
  useIndustrialCanvasStore.setState((prevState) => {
    return {
      ...prevState,
      historyState:
        typeof stateOrUpdateFn === 'function'
          ? stateOrUpdateFn(prevState.historyState)
          : stateOrUpdateFn,
    };
  });
};

export const pushHistoryState = (
  stateUpdateOrFn:
    | IndustryCanvasState
    | ((state: IndustryCanvasState) => IndustryCanvasState)
) => {
  setHistoryState((prevHistoryState) => {
    const currentCanvasState = prevHistoryState.history[prevHistoryState.index];
    const nextHistoryIndex = prevHistoryState.index + 1;

    const prevHistoryTruncated = prevHistoryState.history.slice(
      0,
      nextHistoryIndex
    );
    return {
      history: [
        ...prevHistoryTruncated,
        typeof stateUpdateOrFn === 'function'
          ? stateUpdateOrFn(currentCanvasState)
          : stateUpdateOrFn,
      ],
      index: nextHistoryIndex,
    };
  });
};

export const removeContainerById = (containerIdToRemove: string) => {
  pushHistoryState((prevState: IndustryCanvasState) => {
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
};

export const replaceHistory = (state: IndustryCanvasState) => {
  setHistoryState(() => ({
    history: [state],
    index: 0,
  }));
};

export const undo = () => {
  useIndustrialCanvasStore.setState((prevState) => {
    const nextState =
      prevState.historyState.history[prevState.historyState.index - 1];
    if (nextState === undefined) {
      return prevState;
    }

    return {
      ...prevState,
      historyState: {
        ...prevState.historyState,
        index: prevState.historyState.index - 1,
      },
    };
  });
};

export const redo = () => {
  useIndustrialCanvasStore.setState((prevState) => {
    const nextState =
      prevState.historyState.history[prevState.historyState.index + 1];
    if (nextState === undefined) {
      return prevState;
    }

    return {
      ...prevState,
      historyState: {
        ...prevState.historyState,
        index: prevState.historyState.index + 1,
      },
    };
  });
};

// Shameful because we don't really want to imperatively reset the state, but it's a short term
// solution so this can get merged.
export const shamefulResetState = () => {
  useIndustrialCanvasStore.setState(() => initialState);
};
