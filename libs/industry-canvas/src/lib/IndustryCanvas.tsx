import React, { useCallback, useMemo } from 'react';

import styled from 'styled-components';

import { isDevelopment } from '@cognite/cdf-utilities';
import { useFlag } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';
import ReactUnifiedViewer, {
  isAnnotation,
  UnifiedViewer,
  UnifiedViewerEventListenerMap,
  UnifiedViewerEventType,
  ZoomToFitMode,
} from '@cognite/unified-file-viewer';
import { UnifiedViewerPointerEvent } from '@cognite/unified-file-viewer/dist/core/UnifiedViewerRenderer/UnifiedEventHandler';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import ToolbarComponent from './components/ToolbarComponent';
import ZoomControls from './components/ZoomControls';
import {
  STAGE_ALT_CLICK_ZOOM_LEVEL,
  ZOOM_DURATION_SECONDS,
  ZOOM_TO_FIT_MARGIN,
  ZOOM_LEVELS,
  CANVAS_FLOATING_ELEMENT_MARGIN,
  ZOOM_CONTROLS_COGPILOT_ENABLED_RIGHT_MARGIN,
} from './constants';
import useEditOnSelect from './hooks/useEditOnSelect';
import useIndustryCanvasTooltips from './hooks/useIndustryCanvasTooltips';
import { UseManagedToolReturnType } from './hooks/useManagedTool';
import { UseOnUpdateSelectedAnnotationReturnType } from './hooks/useOnUpdateSelectedAnnotation';
import useRenderContextMenu from './hooks/useRenderContextMenux';
import { useTimeseriesPlural } from './hooks/useTimeseriesPlural';
import { UseTooltipsOptionsReturnType } from './hooks/useTooltipsOptions';
import { OnAddContainerReferences } from './IndustryCanvasPage';
import type { Comment } from './services/comments/types';
import {
  onDeleteRequest,
  selectors,
  setInteractionState,
  setToolType,
  useIndustrialCanvasStore,
} from './state/useIndustrialCanvasStore';
import {
  CanvasAnnotation,
  CanvasNode,
  CommentAnnotation,
  IndustryCanvasContainerConfig,
  IndustryCanvasState,
  IndustryCanvasToolType,
  isIndustryCanvasContainerConfig,
  isIndustryCanvasTimeSeriesContainer,
} from './types';
import { getIndustryCanvasConnectionAnnotations } from './utils/getIndustryCanvasConnectionAnnotations';
import getContainerSummarizationSticky from './utils/getSummarizationSticky';
import summarizeText from './utils/summarizeText';

export type IndustryCanvasProps = {
  id: string;
  applicationId: string;
  shouldShowConnectionAnnotations: boolean;
  onAddContainerReferences: OnAddContainerReferences;
  onRef?: (ref: UnifiedViewer | null) => void;
  viewerRef: UnifiedViewer | null;
  selectedContainers: IndustryCanvasContainerConfig[];
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  commentAnnotations: CommentAnnotation[];
  toolType: IndustryCanvasToolType;
  isCanvasLocked: boolean;
  tool: UseManagedToolReturnType['tool'];
  nodes: IndustryCanvasState['nodes'];
  onUpdateRequest: UnifiedViewerEventListenerMap[UnifiedViewerEventType.ON_UPDATE_REQUEST];
  clickedContainerAnnotation: ExtendedAnnotation | undefined;
  containerAnnotations: ExtendedAnnotation[];
  comments: Comment[];
} & UseOnUpdateSelectedAnnotationReturnType &
  Pick<
    UseTooltipsOptionsReturnType,
    'tooltipsOptions' | 'onUpdateTooltipsOptions'
  >;

export const IndustryCanvas = ({
  id,
  applicationId,
  nodes,
  onUpdateRequest,
  containerAnnotations,
  clickedContainerAnnotation,
  selectedContainers,
  selectedCanvasAnnotation,
  onAddContainerReferences,
  onRef,
  viewerRef,
  toolType,
  onUpdateSelectedAnnotation,
  shouldShowConnectionAnnotations,
  tool,
  comments,
  commentAnnotations,
  isCanvasLocked,
  tooltipsOptions,
  onUpdateTooltipsOptions,
}: IndustryCanvasProps) => {
  const sdk = useSDK();

  const {
    interactionState,
    currentZoomScale,
    pinnedTimeseriesIdsByAnnotationId,
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    liveSensorRulesByAnnotationIdByTimeseriesId,
  } = useIndustrialCanvasStore((state) => ({
    interactionState: state.interactionState,
    currentZoomScale: state.currentZoomScale,
    pinnedTimeseriesIdsByAnnotationId:
      selectors.canvasState(state).pinnedTimeseriesIdsByAnnotationId,
    liveSensorRulesByAnnotationIdByTimeseriesId:
      selectors.canvasState(state).liveSensorRulesByAnnotationIdByTimeseriesId,
    isConditionalFormattingOpenAnnotationIdByTimeseriesId:
      state.isConditionalFormattingOpenAnnotationIdByTimeseriesId,
  }));
  const unifiedViewerRef = React.useRef<UnifiedViewer | null>(null);

  const containers = useMemo(
    () => nodes.filter(isIndustryCanvasContainerConfig),
    [nodes]
  );

  const { renderContextMenu } = useRenderContextMenu({ nodes });

  const onAddSummarizationSticky = async (
    containerConfig: IndustryCanvasContainerConfig,
    text: string,
    isMultiPageDocument: boolean
  ) => {
    const MAX_WORDS_IN_GENERATED_SUMMARY = 80;
    const summary = await summarizeText(
      sdk,
      text,
      MAX_WORDS_IN_GENERATED_SUMMARY
    );
    onUpdateRequest({
      annotations: [
        getContainerSummarizationSticky(
          containerConfig,
          summary,
          isMultiPageDocument
        ),
      ],
      containers: [],
    });
  };

  const tooltips = useIndustryCanvasTooltips({
    selectedContainers,
    containers,
    clickedContainerAnnotation,
    selectedCanvasAnnotation,
    tooltipsOptions,
    onUpdateTooltipsOptions,
    onAddContainerReferences,
    onAddSummarizationSticky,
    onUpdateSelectedAnnotation,
    comments,
    commentAnnotations,
    pinnedTimeseriesIdsByAnnotationId,
    isConditionalFormattingOpenAnnotationIdByTimeseriesId,
    liveSensorRulesByAnnotationIdByTimeseriesId,
  });

  const onStageClick = useCallback(
    (e: UnifiedViewerPointerEvent) => {
      // Sometimes the stage click event is fired when the user creates an annotation.
      // We want the tooltip to stay open in this case.
      // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-507
      if (
        toolType === IndustryCanvasToolType.LINE ||
        toolType === IndustryCanvasToolType.ELLIPSE
      ) {
        return;
      }

      if (e.evt.altKey) {
        unifiedViewerRef.current?.setScale(STAGE_ALT_CLICK_ZOOM_LEVEL, {
          duration: ZOOM_DURATION_SECONDS,
        });
      }

      setInteractionState({
        clickedContainerAnnotationId: undefined,
        hoverId: undefined,
      });
    },
    [toolType]
  );

  const { handleSelect, getAnnotationEditHandlers } = useEditOnSelect(
    unifiedViewerRef,
    toolType
  );

  // Avoid rendering comment annotation twice, as we anyways explicitly provide commentAnnotations
  const commentAnnotationIds = useMemo(
    () => commentAnnotations.map((commentAnnotation) => commentAnnotation.id),
    [commentAnnotations]
  );
  const nodesWithEventHandlers = useMemo(
    () =>
      nodes
        .filter((node) => !commentAnnotationIds.includes(node.id))
        .map((node): CanvasNode => {
          if (!isAnnotation(node)) {
            return node;
          }
          return {
            ...node,
            ...getAnnotationEditHandlers(node),
          };
        }),
    [nodes, commentAnnotationIds, getAnnotationEditHandlers]
  );
  const { data: timeseriesContainerTimeseriesById = {} } = useTimeseriesPlural(
    containers
      .filter(isIndustryCanvasTimeSeriesContainer)
      .map((c) => c.timeseriesId)
  );
  const enhancedNodes: CanvasNode[] = useMemo(
    () => [
      ...nodesWithEventHandlers,
      // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-363
      // ...getClickedContainerOutlineAnnotation(clickedContainer),
      // NOTE: The nodes (annotations) below are order-independent
      ...getIndustryCanvasConnectionAnnotations({
        containers,
        selectedContainers,
        hoverId: interactionState.hoverId,
        clickedId: interactionState.clickedContainerAnnotationId,
        annotations: containerAnnotations,
        shouldShowAllConnectionAnnotations: shouldShowConnectionAnnotations,
        timeseriesById: timeseriesContainerTimeseriesById,
      }),
      ...containerAnnotations,
      ...commentAnnotations,
    ],
    [
      containers,
      selectedContainers,
      interactionState.hoverId,
      interactionState.clickedContainerAnnotationId,
      containerAnnotations,
      shouldShowConnectionAnnotations,
      commentAnnotations,
      nodesWithEventHandlers,
      timeseriesContainerTimeseriesById,
    ]
  );

  const handleRef = useCallback(
    (ref: UnifiedViewer | null) => {
      unifiedViewerRef.current = ref;
      onRef?.(ref);
    },
    [onRef]
  );

  const zoomIn = useCallback(() => {
    if (viewerRef === null) {
      return;
    }

    const currentScale = viewerRef.getScale();
    const newScale = ZOOM_LEVELS.find((stepSize) => stepSize > currentScale);

    viewerRef.setScale(newScale ?? currentScale, {
      duration: ZOOM_DURATION_SECONDS,
    });
  }, [viewerRef]);

  const zoomOut = useCallback(() => {
    if (viewerRef === null) {
      return;
    }

    const currentScale = viewerRef.getScale();
    const newScale = ZOOM_LEVELS.slice()
      .reverse()
      .find((stepSize) => stepSize < currentScale);

    viewerRef.setScale(newScale ?? currentScale, {
      duration: ZOOM_DURATION_SECONDS,
    });
  }, [viewerRef]);

  const { isEnabled: isCogPilotEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
    forceRerender: true,
  });

  return (
    <FullHeightWrapper>
      <ReactUnifiedViewer
        applicationId={applicationId}
        id={id}
        nodes={enhancedNodes}
        tooltips={tooltips}
        onClick={onStageClick}
        shouldShowZoomControls={false}
        shouldUseAdaptiveRendering
        setRef={handleRef}
        tool={tool}
        onSelect={handleSelect}
        onDeleteRequest={onDeleteRequest}
        onUpdateRequest={onUpdateRequest}
        initialViewport={{
          x: 2000,
          y: 500,
          width: 4000,
          height: 1000,
        }}
        renderContextMenu={renderContextMenu}
        cogniteClient={sdk}
        shouldAllowDragDrop={false} // We are using our own drag and drop handlers
        namespace="industrialCanvas"
      />
      <ToolbarWrapper>
        <ToolbarComponent
          activeTool={toolType}
          onToolChange={setToolType}
          isCanvasLocked={isCanvasLocked}
        />
      </ToolbarWrapper>
      <ZoomControlsWrapper isCogPilotEnabled={isCogPilotEnabled}>
        <ZoomControls
          currentZoomScale={currentZoomScale}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          zoomToFit={() => {
            viewerRef?.zoomToFit(ZoomToFitMode.DEFAULT, {
              relativeMargin: ZOOM_TO_FIT_MARGIN,
            });
          }}
          setZoomScale={(value: number) => {
            viewerRef?.setScale(value);
          }}
        />
      </ZoomControlsWrapper>
    </FullHeightWrapper>
  );
};

const FullHeightWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;

// TODO right: ${isDevelopment() ? 70 : CANVAS_FLOATING_ELEMENT_MARGIN}px;
const ZoomControlsWrapper = styled.div<{ isCogPilotEnabled: boolean }>`
  position: absolute;
  bottom: ${CANVAS_FLOATING_ELEMENT_MARGIN}px;
  right: ${({ isCogPilotEnabled }) =>
    isCogPilotEnabled
      ? ZOOM_CONTROLS_COGPILOT_ENABLED_RIGHT_MARGIN
      : CANVAS_FLOATING_ELEMENT_MARGIN}px;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  bottom: ${isDevelopment() ? 70 : CANVAS_FLOATING_ELEMENT_MARGIN}px;
  left: ${CANVAS_FLOATING_ELEMENT_MARGIN}px;
`;
