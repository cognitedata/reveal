import ReactUnifiedViewer, {
  Annotation,
  ToolType,
  UnifiedViewer,
  ZoomToFitMode,
} from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { useContainerAnnotations } from './hooks/useContainerAnnotations';
import { UseManagedStateReturnType } from './hooks/useManagedState';
import useIndustryCanvasTooltips from './hooks/useIndustryCanvasTooltips';
import ToolbarComponent from './components/ToolbarComponent';
import ZoomControls from './components/ZoomControls';
import { ZOOM_TO_FIT_MARGIN } from './constants';
import { isDevelopment } from '@cognite/cdf-utilities';
import { CanvasAnnotation, IndustryCanvasContainerConfig } from './types';
import { useSDK } from '@cognite/sdk-provider';
import { getIndustryCanvasConnectionAnnotations } from './utils/getIndustryCanvasConnectionAnnotations';
import { UseManagedToolsReturnType } from './hooks/useManagedTools';

export type IndustryCanvasProps = {
  id: string;
  applicationId: string;
  currentZoomScale: number;
  onAddContainerReferences: UseManagedStateReturnType['addContainerReferences'];
  onRef?: (ref: UnifiedViewer | null) => void;
  viewerRef: UnifiedViewer | null;
  selectedContainer: IndustryCanvasContainerConfig | undefined;
  selectedCanvasAnnotation: CanvasAnnotation | undefined;
  tool: ToolType;
  setTool: Dispatch<SetStateAction<ToolType>>;
} & Pick<
  UseManagedStateReturnType,
  | 'container'
  | 'canvasAnnotations'
  | 'onDeleteRequest'
  | 'onUpdateRequest'
  | 'updateContainerById'
  | 'removeContainerById'
  | 'interactionState'
  | 'setInteractionState'
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
  selectedContainer,
  selectedCanvasAnnotation,
  onAddContainerReferences,
  onRef,
  viewerRef,
  tool,
  setTool,
  onUpdateAnnotationStyleByType,
  toolOptions,
}: IndustryCanvasProps) => {
  const sdk = useSDK();

  const onClickContainerAnnotation = useCallback(
    (annotation: ExtendedAnnotation) =>
      setInteractionState((prevInteractionState) => ({
        clickedContainerId: undefined,
        hoverId: undefined,
        clickedContainerAnnotationId:
          prevInteractionState.clickedContainerAnnotationId === annotation.id
            ? undefined
            : annotation.id,
      })),
    [setInteractionState]
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
    container,
    selectedAnnotationId: interactionState.clickedContainerAnnotationId,
    hoverId: interactionState.hoverId,
    onClick: onClickContainerAnnotation,
    onMouseOver: onMouseOverContainerAnnotation,
    onMouseOut: onMouseOutContainerAnnotation,
  });

  const selectedContainerAnnotation = useMemo(
    () =>
      containerAnnotations.find(
        (annotation) =>
          annotation.id === interactionState.clickedContainerAnnotationId
      ),
    [containerAnnotations, interactionState.clickedContainerAnnotationId]
  );

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

  const tooltips = useIndustryCanvasTooltips({
    clickedContainer: selectedContainer,
    containerAnnotations,
    selectedContainerAnnotation,
    selectedCanvasAnnotation,
    onAddContainerReferences,
    onDeleteSelectedCanvasAnnotation,
    onUpdateAnnotationStyleByType,
    updateContainerById,
    removeContainerById,
  });

  const onStageClick = useCallback(() => {
    // Sometimes the stage click event is fired when the user creates an annotation.
    // We want the tooltip to stay open in this case.
    // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-507
    if (tool === ToolType.LINE || tool === ToolType.ELLIPSE) {
      return;
    }
    setInteractionState({
      clickedContainerAnnotationId: undefined,
      hoverId: undefined,
    });
  }, [setInteractionState, tool]);

  const canvasAnnotationWithEventHandlers = useMemo(
    () =>
      canvasAnnotations.map((canvasAnnotation) => ({
        ...canvasAnnotation,
        onClick: (e: any, annotation: CanvasAnnotation) => {
          e.cancelBubble = true;
          setInteractionState({
            hoverId: undefined,
            clickedContainerAnnotationId: annotation.id,
          });
        },
      })),
    [canvasAnnotations, setInteractionState]
  );

  const enhancedAnnotations: Annotation[] = useMemo(
    () => [
      // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-363
      // ...getClickedContainerOutlineAnnotation(clickedContainer),
      ...getIndustryCanvasConnectionAnnotations({
        container,
        hoverId: interactionState.hoverId,
        annotations: containerAnnotations,
      }),
      ...containerAnnotations,
      ...canvasAnnotationWithEventHandlers,
    ],
    [
      container,
      interactionState.hoverId,
      containerAnnotations,
      canvasAnnotationWithEventHandlers,
    ]
  );

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
        setRef={onRef}
        tool={tool}
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
      />
      <ToolbarWrapper>
        <ToolbarComponent activeTool={tool} onToolChange={setTool} />
      </ToolbarWrapper>
      <ZoomControlsWrapper>
        <ZoomControls
          currentZoomScale={currentZoomScale}
          zoomIn={viewerRef?.zoomIn}
          zoomOut={viewerRef?.zoomOut}
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
