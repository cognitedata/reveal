import { useSDK } from '@cognite/sdk-provider';
import ReactUnifiedViewer, {
  Annotation,
  getContainerConfigFromFileInfo,
  UnifiedViewer,
  UnifiedViewerMouseEvent,
  ToolType,
  getTimeseriesContainerConfig,
} from '@cognite/unified-file-viewer';
import { OnAddContainerReferences } from './hooks/useIndustryCanvasAddContainerReferences';
import { getIndustryCanvasConnectionAnnotations } from './utils/getIndustryCanvasConnectionAnnotations';
import { getContainerId } from './utils/utils';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { useContainerAnnotations } from './hooks/useContainerAnnotations';
import { UseManagedStateReturnType } from './hooks/useManagedState';
import useManagedTools from './hooks/useManagedTools';
import useIndustryCanvasTooltips from './hooks/useIndustryCanvasTooltips';
import ToolbarComponent from './components/ToolbarComponent';
import {
  DEFAULT_TIMESERIES_HEIGHT,
  DEFAULT_TIMESERIES_WIDTH,
} from './utils/addDimensionsToContainerReferences';
import {
  CanvasAnnotation,
  ContainerReference,
  ContainerReferenceType,
} from './types';

export type IndustryCanvasProps = {
  id: string;
  applicationId: string;
  onAddContainerReferences: OnAddContainerReferences;
  onRef?: (ref: UnifiedViewer | null) => void;
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
>;

export const IndustryCanvas = ({
  id,
  applicationId,
  container,
  setContainer,
  canvasAnnotations,
  onDeleteRequest,
  onUpdateRequest,
  containerReferences,
  updateContainerReference,
  removeContainerReference,
  onAddContainerReferences,
  onRef,
}: IndustryCanvasProps) => {
  const [
    { hoverId, clickedContainer, selectedAnnotationId },
    setInteractionState,
  ] = useState<{
    hoverId: string | undefined;
    clickedContainer: ContainerReference | undefined;
    selectedAnnotationId: string | undefined;
  }>({
    hoverId: undefined,
    clickedContainer: undefined,
    selectedAnnotationId: undefined,
  });

  const selectedCanvasAnnotation = useMemo(
    () =>
      selectedAnnotationId
        ? canvasAnnotations.find(
            (annotation) => annotation.id === selectedAnnotationId
          )
        : undefined,
    [canvasAnnotations, selectedAnnotationId]
  );

  const {
    tool,
    toolOptions,
    setTool,
    shapeAnnotationStyle,
    onUpdateShapeAnnotationStyle,
  } = useManagedTools({
    initialTool: ToolType.PAN,
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
    []
  );

  const onMouseOverContainerAnnotation = useCallback(
    (annotation: Annotation) => {
      setInteractionState((prevInteractionState) => ({
        ...prevInteractionState,
        hoverId: annotation.id,
      }));
    },
    []
  );

  const onMouseOutContainerAnnotation = useCallback(() => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: undefined,
    }));
  }, []);

  const containerAnnotations = useContainerAnnotations({
    containerReferences,
    selectedAnnotationId,
    hoverId,
    onClick: onClickContainerAnnotation,
    onMouseOver: onMouseOverContainerAnnotation,
    onMouseOut: onMouseOutContainerAnnotation,
  });

  const selectedContainerAnnotation = useMemo(
    () =>
      containerAnnotations.find(
        (annotation) => annotation.id === selectedAnnotationId
      ),
    [containerAnnotations, selectedAnnotationId]
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
              { id: containerReference.id },
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
              { id: containerReference.id },
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
                timeseriesId: containerReference.id,
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
  }, [setContainer, sdk, containerReferences]);

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
  }, [selectedCanvasAnnotation, onDeleteRequest]);

  const tooltips = useIndustryCanvasTooltips({
    containerAnnotations,
    selectedContainerAnnotation,
    selectedCanvasAnnotation,
    clickedContainer,
    onAddContainerReferences,
    containerReferences,
    removeContainerReference,
    onDeleteSelectedCanvasAnnotation,
    shapeAnnotationStyle,
    onUpdateShapeAnnotationStyle,
    updateContainerReference,
  });

  const onStageClick = useCallback(() => {
    setInteractionState({
      selectedAnnotationId: undefined,
      clickedContainer: undefined,
      hoverId: undefined,
    });
  }, [setInteractionState]);

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
    [canvasAnnotations]
  );

  const enhancedAnnotations: Annotation[] = useMemo(
    () => [
      // TODO: Bug tracked by https://cognitedata.atlassian.net/browse/UFV-363
      // ...getClickedContainerOutlineAnnotation(clickedContainer),
      ...getIndustryCanvasConnectionAnnotations({
        containerReferences,
        hoverId,
        annotations: containerAnnotations,
      }),
      ...containerAnnotations,
      ...canvasAnnotationWithEventHandlers,
    ],
    [
      containerReferences,
      containerAnnotations,
      hoverId,
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
          shouldShowZoomControls
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

const ToolbarWrapper = styled.div`
  position: absolute;
  bottom: 50px;
  left: 50px;
`;
