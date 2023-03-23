import { useSDK } from '@cognite/sdk-provider';
import ReactUnifiedViewer, {
  Annotation,
  getAssetTableContainerConfig,
  getContainerConfigFromFileInfo,
  getTimeseriesContainerConfig,
  ToolType,
  UnifiedViewer,
  UnifiedViewerMouseEvent,
  ZoomToFitMode,
} from '@cognite/unified-file-viewer';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { useContainerAnnotations } from './hooks/useContainerAnnotations';
import { OnAddContainerReferences } from './hooks/useIndustryCanvasAddContainerReferences';
import { UseManagedStateReturnType } from './hooks/useManagedState';
import useManagedTools from './hooks/useManagedTools';
import useIndustryCanvasTooltips from './hooks/useIndustryCanvasTooltips';
import ToolbarComponent from './components/ToolbarComponent';
import {
  DEFAULT_ASSET_HEIGHT,
  DEFAULT_ASSET_WIDTH,
  DEFAULT_TIMESERIES_HEIGHT,
  DEFAULT_TIMESERIES_WIDTH,
} from './utils/addDimensionsToContainerReferences';
import { CanvasAnnotation, ContainerReferenceType } from './types';
import { getIndustryCanvasConnectionAnnotations } from './utils/getIndustryCanvasConnectionAnnotations';
import { getContainerId } from './utils/utils';
import ZoomControls from './components/ZoomControls';
import { ZOOM_TO_FIT_MARGIN } from './constants';
import { isDevelopment } from '@cognite/cdf-utilities';

export type IndustryCanvasProps = {
  id: string;
  applicationId: string;
  currentZoomScale: number;
  onAddContainerReferences: OnAddContainerReferences;
  onRef?: (ref: UnifiedViewer | null) => void;
  viewerRef: UnifiedViewer | null;
} & Pick<
  UseManagedStateReturnType,
  | 'container'
  | 'setContainer'
  | 'canvasAnnotations'
  | 'onDeleteRequest'
  | 'onUpdateRequest'
  | 'containerReferences'
  | 'updateContainerReference'
  | 'removeContainerReference'
  | 'interactionState'
  | 'setInteractionState'
>;

export const IndustryCanvas = ({
  id,
  applicationId,
  container,
  setContainer,
  canvasAnnotations,
  currentZoomScale,
  onDeleteRequest,
  onUpdateRequest,
  containerReferences,
  updateContainerReference,
  removeContainerReference,
  interactionState,
  setInteractionState,
  onAddContainerReferences,
  onRef,
  viewerRef,
}: IndustryCanvasProps) => {
  const selectedCanvasAnnotation = useMemo(
    () =>
      interactionState.selectedAnnotationId
        ? canvasAnnotations.find(
            (annotation) =>
              annotation.id === interactionState.selectedAnnotationId
          )
        : undefined,
    [canvasAnnotations, interactionState.selectedAnnotationId]
  );

  const { tool, toolOptions, setTool, onUpdateAnnotationStyleByType } =
    useManagedTools({
      initialTool: ToolType.SELECT,
      selectedCanvasAnnotation,
      onUpdateRequest,
    });

  const sdk = useSDK();

  const onClickContainerAnnotation = useCallback(
    (annotation: ExtendedAnnotation) =>
      setInteractionState((prevInteractionState) => ({
        clickedContainer: undefined,
        hoverId: undefined,
        selectedAnnotationId:
          prevInteractionState.selectedAnnotationId === annotation.id
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
    containerReferences,
    selectedAnnotationId: interactionState.selectedAnnotationId,
    hoverId: interactionState.hoverId,
    onClick: onClickContainerAnnotation,
    onMouseOver: onMouseOverContainerAnnotation,
    onMouseOut: onMouseOutContainerAnnotation,
  });

  const selectedContainerAnnotation = useMemo(
    () =>
      containerAnnotations.find(
        (annotation) => annotation.id === interactionState.selectedAnnotationId
      ),
    [containerAnnotations, interactionState.selectedAnnotationId]
  );

  useEffect(() => {
    (async () => {
      const children = await Promise.all(
        containerReferences.map(async (containerReference) => {
          const clickHandler = (e: UnifiedViewerMouseEvent) => {
            e.cancelBubble = true;
            setInteractionState({
              hoverId: undefined,
              clickedContainer: containerReference,
              selectedAnnotationId: undefined,
            });
          };

          if (containerReference.type === ContainerReferenceType.FILE) {
            const fileInfos = await sdk.files.retrieve([
              { id: containerReference.resourceId },
            ]);

            if (fileInfos.length !== 1) {
              throw new Error('Expected to find exactly one file');
            }
            const fileInfo = fileInfos[0];
            return getContainerConfigFromFileInfo(sdk as any, fileInfo, {
              id: getContainerId(containerReference),
              label: fileInfo.name ?? fileInfo.externalId,
              page: containerReference.page,
              x: containerReference.x,
              y: containerReference.y,
              width: containerReference.width,
              height: containerReference.height,
              maxWidth: containerReference.maxWidth,
              maxHeight: containerReference.maxHeight,
              fontSize: 24,
              onClick: clickHandler,
            });
          }

          if (containerReference.type === ContainerReferenceType.TIMESERIES) {
            const timeseries = await sdk.timeseries.retrieve([
              { id: containerReference.resourceId },
            ]);

            if (timeseries.length !== 1) {
              throw new Error('Expected to find exactly one timeseries');
            }

            return getTimeseriesContainerConfig(
              sdk as any,
              {
                id: getContainerId(containerReference),
                label: timeseries[0].name ?? timeseries[0].externalId,
                onClick: clickHandler,
                startDate: containerReference.startDate,
                endDate: containerReference.endDate,
                x: containerReference.x,
                y: containerReference.y,
                width: containerReference.width ?? DEFAULT_TIMESERIES_WIDTH,
                height: containerReference.height ?? DEFAULT_TIMESERIES_HEIGHT,
              },
              {
                timeseriesId: containerReference.resourceId,
              }
            );
          }

          if (containerReference.type === ContainerReferenceType.ASSET) {
            const asset = await sdk.assets.retrieve([
              { id: containerReference.resourceId },
            ]);

            if (asset.length !== 1) {
              throw new Error('Expected to find exactly one asset');
            }

            return getAssetTableContainerConfig(
              sdk as any,
              {
                id: getContainerId(containerReference),
                label: asset[0].name ?? asset[0].externalId,
                onClick: clickHandler,
                x: containerReference.x,
                y: containerReference.y,
                width: containerReference.width ?? DEFAULT_ASSET_WIDTH,
                height: containerReference.height ?? DEFAULT_ASSET_HEIGHT,
              },
              {
                assetId: containerReference.resourceId,
              }
            );
          }

          throw new Error('Unsupported container reference type');
        })
      );
      setContainer((prevState) => ({
        ...prevState,
        children,
      }));
    })();
  }, [setContainer, sdk, containerReferences, setInteractionState]);

  const onDeleteSelectedCanvasAnnotation = useCallback(() => {
    setInteractionState({
      clickedContainer: undefined,
      hoverId: undefined,
      selectedAnnotationId: undefined,
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
    containerAnnotations,
    selectedContainerAnnotation,
    selectedCanvasAnnotation,
    clickedContainer: interactionState.clickedContainer,
    onAddContainerReferences,
    containerReferences,
    removeContainerReference,
    onDeleteSelectedCanvasAnnotation,
    onUpdateAnnotationStyleByType,
    updateContainerReference,
  });

  const onStageClick = useCallback(() => {
    // Sometimes the stage click event is fired when the user creates a line annotation.
    // We want the tooltip to stay open in this case.
    // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-507
    if (tool === ToolType.LINE) {
      return;
    }
    setInteractionState({
      selectedAnnotationId: undefined,
      clickedContainer: undefined,
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
            clickedContainer: undefined,
            hoverId: undefined,
            selectedAnnotationId: annotation.id,
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
        containerReferences,
        hoverId: interactionState.hoverId,
        annotations: containerAnnotations,
      }),
      ...containerAnnotations,
      ...canvasAnnotationWithEventHandlers,
    ],
    [
      containerReferences,
      containerAnnotations,
      interactionState.hoverId,
      canvasAnnotationWithEventHandlers,
    ]
  );

  return (
    <FullHeightWrapper>
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
const SIDE_MARGIN = isDevelopment() ? 70 : 20;

const ZoomControlsWrapper = styled.div`
  position: absolute;
  bottom: ${BOTTOM_MARGIN}px;
  right: ${SIDE_MARGIN}px;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  bottom: ${BOTTOM_MARGIN}px;
  left: ${SIDE_MARGIN}px;
`;
