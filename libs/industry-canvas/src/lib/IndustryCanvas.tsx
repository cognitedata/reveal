import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import styled from 'styled-components';

import { isDevelopment } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import ReactUnifiedViewer, {
  Annotation,
  ToolType,
  UnifiedViewer,
  ZoomToFitMode,
} from '@cognite/unified-file-viewer';
import { UnifiedViewerPointerEvent } from '@cognite/unified-file-viewer/dist/core/UnifiedViewerRenderer/UnifiedEventHandler';

import ToolbarComponent from './components/ToolbarComponent';
import ZoomControls from './components/ZoomControls';
import {
  STAGE_ALT_CLICK_ZOOM_LEVEL,
  ZOOM_DURATION_SECONDS,
  ZOOM_TO_FIT_MARGIN,
  ZOOM_LEVELS,
} from './constants';
import useEditOnSelect from './hooks/useEditOnSelect';
import useIndustryCanvasTooltips from './hooks/useIndustryCanvasTooltips';
import { UseManagedStateReturnType } from './hooks/useManagedState';
import { UseManagedToolsReturnType } from './hooks/useManagedTools';
import { useTooltipsOptions } from './hooks/useTooltipsOptions';
import { OnAddContainerReferences } from './IndustryCanvasPage';
import { CanvasAnnotation, IndustryCanvasContainerConfig } from './types';
import { getIndustryCanvasConnectionAnnotations } from './utils/getIndustryCanvasConnectionAnnotations';
import getContainerSummarizationSticky from './utils/getSummarizationSticky';
import summarizeText from './utils/summarizeText';

export type IndustryCanvasProps = {
  id: string;
  applicationId: string;
  shouldShowConnectionAnnotations: boolean;
  currentZoomScale: number;
  onAddContainerReferences: OnAddContainerReferences;
  onRef?: (ref: UnifiedViewer | null) => void;
  viewerRef: UnifiedViewer | null;
  selectedContainer: IndustryCanvasContainerConfig | undefined;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  tool: ToolType;
  setTool: Dispatch<SetStateAction<ToolType>>;
  isCanvasLocked: boolean;
} & Pick<
  UseManagedStateReturnType,
  | 'container'
  | 'canvasAnnotations'
  | 'onDeleteRequest'
  | 'onUpdateRequest'
  | 'updateContainerById'
  | 'removeContainerById'
  | 'clickedContainerAnnotation'
  | 'interactionState'
  | 'setInteractionState'
  | 'containerAnnotations'
> &
  Pick<
    UseManagedToolsReturnType,
    'toolOptions' | 'onUpdateAnnotationStyleByType'
  >;

export const IndustryCanvas = ({
  id,
  applicationId,
  container,
  canvasAnnotations,
  currentZoomScale,
  onDeleteRequest,
  onUpdateRequest,
  updateContainerById,
  removeContainerById,
  interactionState,
  setInteractionState,
  containerAnnotations,
  clickedContainerAnnotation,
  selectedContainer,
  selectedCanvasAnnotation,
  onAddContainerReferences,
  onRef,
  viewerRef,
  tool,
  setTool,
  onUpdateAnnotationStyleByType,
  shouldShowConnectionAnnotations,
  toolOptions,
  isCanvasLocked,
}: IndustryCanvasProps) => {
  const sdk = useSDK();

  const unifiedViewerRef = React.useRef<UnifiedViewer | null>(null);
  const { tooltipsOptions, onUpdateTooltipsOptions } = useTooltipsOptions();

  const onDeleteSelectedCanvasAnnotation = useCallback(() => {
    setInteractionState({
      hoverId: undefined,
      clickedContainerAnnotationId: undefined,
    });
    onDeleteRequest({
      annotationIds:
        selectedCanvasAnnotation === undefined
          ? []
          : [selectedCanvasAnnotation.id],
      containerIds: [],
    });
  }, [selectedCanvasAnnotation, onDeleteRequest, setInteractionState]);

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
    selectedContainer,
    containers: container.children ?? [],
    containerAnnotations,
    clickedContainerAnnotation,
    selectedCanvasAnnotation,
    tooltipsOptions,
    onUpdateTooltipsOptions,
    onAddContainerReferences,
    onAddSummarizationSticky,
    onDeleteSelectedCanvasAnnotation,
    onUpdateAnnotationStyleByType,
    updateContainerById,
    removeContainerById,
  });

  const onStageClick = useCallback(
    (e: UnifiedViewerPointerEvent) => {
      // Sometimes the stage click event is fired when the user creates an annotation.
      // We want the tooltip to stay open in this case.
      // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-507
      if (tool === ToolType.LINE || tool === ToolType.ELLIPSE) {
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
    [setInteractionState, tool]
  );

  const { handleSelect, getAnnotationEditHandlers } = useEditOnSelect(
    unifiedViewerRef,
    setTool
  );

  const canvasAnnotationWithEventHandlers = useMemo(
    () =>
      canvasAnnotations.map((canvasAnnotation) => ({
        ...canvasAnnotation,
        ...getAnnotationEditHandlers(canvasAnnotation),
        onClick: (e: any, annotation: CanvasAnnotation) => {
          e.cancelBubble = true;
          setInteractionState({
            hoverId: undefined,
            clickedContainerAnnotationId: annotation.id,
          });
        },
      })),
    [canvasAnnotations, setInteractionState, getAnnotationEditHandlers]
  );

  const enhancedAnnotations: Annotation[] = useMemo(
    () => [
      // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-363
      // ...getClickedContainerOutlineAnnotation(clickedContainer),
      ...getIndustryCanvasConnectionAnnotations({
        container,
        hoverId: interactionState.hoverId,
        annotations: containerAnnotations,
        shouldShowAllConnectionAnnotations: shouldShowConnectionAnnotations,
      }),
      ...containerAnnotations,
      ...canvasAnnotationWithEventHandlers,
    ],
    [
      container,
      interactionState.hoverId,
      containerAnnotations,
      canvasAnnotationWithEventHandlers,
      shouldShowConnectionAnnotations,
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

  return (
    <FullHeightWrapper>
      <ReactUnifiedViewer
        applicationId={applicationId}
        id={id}
        container={container}
        annotations={enhancedAnnotations}
        tooltips={tooltips}
        onClick={onStageClick}
        shouldShowZoomControls={false}
        setRef={handleRef}
        tool={tool}
        onSelect={handleSelect}
        toolOptions={toolOptions}
        onDeleteRequest={onDeleteRequest}
        onUpdateRequest={onUpdateRequest}
        initialViewport={{
          x: 2000,
          y: 500,
          width: 4000,
          height: 1000,
        }}
        // We are using a different version of the SDK in the library
        // but the conflicts are irrelevant for IC, so just recasting sadly
        cogniteClient={sdk as any}
        shouldAllowDragDrop={false} // We are using our own drag and drop handlers
      />
      <ToolbarWrapper>
        <ToolbarComponent
          activeTool={tool}
          onToolChange={setTool}
          isCanvasLocked={isCanvasLocked}
        />
      </ToolbarWrapper>
      <ZoomControlsWrapper>
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

const BOTTOM_MARGIN = 20;
const SIDE_MARGIN = 20;

const ZoomControlsWrapper = styled.div`
  position: absolute;
  bottom: ${BOTTOM_MARGIN}px;
  right: ${isDevelopment() ? 70 : SIDE_MARGIN}px;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  bottom: ${isDevelopment() ? 70 : BOTTOM_MARGIN}px;
  left: ${SIDE_MARGIN}px;
`;
