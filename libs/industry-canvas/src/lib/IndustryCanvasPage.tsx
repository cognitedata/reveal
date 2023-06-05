import { KeyboardEventHandler, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { ResourceSelector } from '@data-exploration/containers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';

import { createLink, PageTitle } from '@cognite/cdf-utilities';
import {
  Button,
  Dropdown,
  Menu,
  Colors,
  Flex,
  Icon,
  toast,
  Tooltip,
} from '@cognite/cogs.js';
import { isNotUndefined, ResourceItem } from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';
import {
  ToolType,
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';

import { useDialog } from '@data-exploration-lib/core';

import CanvasDropdown from './components/CanvasDropdown';
import { CanvasTitle } from './components/CanvasTitle';
import DragOverIndicator from './components/DragOverIndicator';
import IndustryCanvasFileUploadModal from './components/IndustryCanvasFileUploadModal/IndustryCanvasFileUploadModal';
import {
  SEARCH_QUERY_PARAM_KEY,
  SHAMEFUL_WAIT_TO_ENSURE_CONTAINERS_ARE_RENDERED_MS,
  TOAST_POSITION,
} from './constants';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import useManagedState from './hooks/useManagedState';
import useManagedTools from './hooks/useManagedTools';
import { useQueryParameter } from './hooks/useQueryParameter';
import { useSelectedAnnotationOrContainer } from './hooks/useSelectedAnnotationOrContainer';
import { IndustryCanvas } from './IndustryCanvas';
import {
  IndustryCanvasProvider,
  useIndustryCanvasContext,
} from './IndustryCanvasContext';
import { ContainerReference, ContainerReferenceType } from './types';
import { UserProfileProvider } from './UserProfileProvider';
import {
  DEFAULT_CONTAINER_MAX_HEIGHT,
  DEFAULT_CONTAINER_MAX_WIDTH,
} from './utils/addDimensionsToContainerReference';
import isSupportedResourceItem from './utils/isSupportedResourceItem';
import resourceItemToContainerReference from './utils/resourceItemToContainerReference';
import useManagedTool from './utils/useManagedTool';
import { zoomToFitAroundContainerIds } from './utils/zoomToFitAroundContainerIds';

export type OnAddContainerReferences = (
  containerReferences: ContainerReference[]
) => void;

const APPLICATION_ID_INDUSTRY_CANVAS = 'industryCanvas';

const IndustryCanvasPageWithoutQueryClientProvider = () => {
  const navigate = useNavigate();
  const [unifiedViewerRef, setUnifiedViewerRef] =
    useState<UnifiedViewer | null>(null);
  const [shouldShowConnectionAnnotations, setShouldShowConnectionAnnotations] =
    useState<boolean>(true);
  const [currentZoomScale, setCurrentZoomScale] = useState<number>(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [
    hasConsumedInitializeWithContainerReferences,
    setHasConsumedInitializeWithContainerReferences,
  ] = useState(false);
  const { tool, setTool } = useManagedTool(ToolType.SELECT);
  const { queryString } = useQueryParameter({ key: SEARCH_QUERY_PARAM_KEY });

  const sdk = useSDK();
  const {
    activeCanvas,
    canvases,
    isCreatingCanvas,
    isSavingCanvas,
    isLoadingCanvas,
    isListingCanvases,
    saveCanvas,
    createCanvas,
    initializeWithContainerReferences,
    setCanvasId,
  } = useIndustryCanvasContext();

  const {
    container,
    canvasAnnotations,
    addContainerReferences,
    updateContainerById,
    removeContainerById,
    onDeleteRequest,
    onUpdateRequest,
    undo,
    redo,
    clickedContainerAnnotation,
    interactionState,
    setInteractionState,
    containerAnnotations,
  } = useManagedState({
    unifiedViewer: unifiedViewerRef,
    setTool,
  });

  const {
    isOpen: visibleResourceSelector,
    open: onResourceSelectorOpen,
    close: onResourceSelectorClose,
  } = useDialog();
  const { selectedCanvasAnnotation, selectedContainer } =
    useSelectedAnnotationOrContainer({
      unifiedViewerRef,
      tool,
      canvasAnnotations,
      container,
    });

  const { onUpdateAnnotationStyleByType, toolOptions } = useManagedTools({
    tool,
    selectedCanvasAnnotation,
    onUpdateRequest,
  });

  const { fileDropData, resetFileDropData, isDragging, onDrop } =
    useDragAndDrop({
      unifiedViewerRef: unifiedViewerRef,
    });

  const onDownloadPress = () => {
    unifiedViewerRef?.exportWorkspaceToPdf();
  };

  useEffect(() => {
    if (unifiedViewerRef === null) {
      return;
    }
    setCurrentZoomScale(unifiedViewerRef.getScale());
    unifiedViewerRef.addEventListener(
      UnifiedViewerEventType.ON_ZOOM_CHANGE,
      setCurrentZoomScale
    );
  }, [unifiedViewerRef]);

  const onAddContainerReferences: OnAddContainerReferences = useCallback(
    (containerReferences: ContainerReference[]) => {
      if (unifiedViewerRef === null) {
        return;
      }

      // Ensure that we don't add a container with an ID that already exists
      const currentContainerIds = new Set(
        (container?.children ?? []).map((c) => c.id)
      );
      const containerReferencesToAdd = containerReferences.filter(
        (containerReference) =>
          containerReference.id === undefined ||
          !currentContainerIds.has(containerReference.id)
      );

      if (containerReferencesToAdd.length !== containerReferences.length) {
        toast.error(
          <div>
            <h4>Could not add resource(s) to your canvas</h4>
            <p>Resource(s) already added to the canvas.</p>
          </div>,
          {
            toastId: `canvas-file-already-added-${uuid()}`,
            position: TOAST_POSITION,
          }
        );
      }

      if (containerReferencesToAdd.length === 0) {
        return;
      }

      addContainerReferences(containerReferencesToAdd).then((containers) => {
        // When we add new containers, we want to zoom to fit and select them.
        // Since the new containers might not be rendered immediately, we need to wait a bit before we can do that.
        setTimeout(() => {
          zoomToFitAroundContainerIds({
            unifiedViewer: unifiedViewerRef,
            containerIds: [
              selectedContainer?.id,
              clickedContainerAnnotation?.containerId,
              ...containers.map((c) => c.id),
            ].filter(isNotUndefined),
          });

          unifiedViewerRef.selectByIds({
            containerIds: containers.map((c) => c.id),
            annotationIds: [],
          });
        }, SHAMEFUL_WAIT_TO_ENSURE_CONTAINERS_ARE_RENDERED_MS);
      });

      toast.success(
        <div>
          <h4>Resource(s) added to your canvas</h4>
        </div>,
        {
          toastId: `canvas-file-added-${uuid()}`,
          position: TOAST_POSITION,
        }
      );
    },
    [
      addContainerReferences,
      unifiedViewerRef,
      selectedContainer?.id,
      clickedContainerAnnotation,
      container?.children,
    ]
  );

  const onAddResourcePress = async (
    results?: ResourceItem | ResourceItem[]
  ) => {
    onResourceSelectorClose();
    if (results && Array.isArray(results)) {
      if (unifiedViewerRef === null) {
        return;
      }

      if (results === undefined || results.length === 0) {
        toast.error(
          <div>
            <h4>Could not add resource(s) to your canvas</h4>
            <p>At least one resource needs to be selected.</p>
          </div>,
          {
            toastId: 'industry-canvas-no-selected-resources-to-add-error',
            position: TOAST_POSITION,
          }
        );
        return;
      }

      const supportedResourceItems = (
        await Promise.all(
          results.map(async (resourceItem) => {
            const isSupported = await isSupportedResourceItem(
              sdk,
              resourceItem
            );
            return isSupported ? resourceItem : undefined;
          })
        )
      ).filter(isNotUndefined);

      if (supportedResourceItems.length === 0) {
        // TODO: Improve messaging if selected resources are not supported
        return;
      }

      onAddContainerReferences(
        supportedResourceItems.map(resourceItemToContainerReference)
      );
    }
  };

  useEffect(() => {
    if (unifiedViewerRef === null) {
      return;
    }

    if (activeCanvas?.externalId === undefined) {
      return;
    }

    if (hasConsumedInitializeWithContainerReferences) {
      return;
    }

    if (initializeWithContainerReferences !== undefined) {
      onAddContainerReferences(initializeWithContainerReferences);
    }

    setHasConsumedInitializeWithContainerReferences(true);
  }, [
    initializeWithContainerReferences,
    activeCanvas?.externalId,
    unifiedViewerRef,
    hasConsumedInitializeWithContainerReferences,
    onAddContainerReferences,
  ]);

  const onKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      if (event.shiftKey) {
        redo.fn();
        return;
      }
      undo.fn();
      return;
    }

    if (event.key === 'Escape') {
      unifiedViewerRef?.selectByIds({
        containerIds: [],
        annotationIds: [],
      });
      return;
    }
  };

  const handleGoBackToIndustryCanvasButtonClick = () => {
    navigate(
      createLink('/explore/industryCanvas', {
        [SEARCH_QUERY_PARAM_KEY]: queryString,
      })
    );
  };

  return (
    <>
      <ResourceSelector
        onSelect={onAddResourcePress}
        visible={visibleResourceSelector}
        onClose={onResourceSelectorClose}
        visibleResourceTabs={['file', 'timeSeries', 'asset', 'event']}
        selectionMode="multiple"
      />
      <PageTitle title="Industry Canvas" />
      <TitleRowWrapper>
        <PreviewLinkWrapper>
          <Flex alignItems="center">
            <Tooltip
              content="Go back to Industry Canvas home page"
              position="bottom"
            >
              <Button
                icon="ArrowLeft"
                onClick={handleGoBackToIndustryCanvasButtonClick}
              />
            </Tooltip>
            <CanvasTitle
              activeCanvas={activeCanvas}
              saveCanvas={saveCanvas}
              isEditingTitle={isEditingTitle}
              setIsEditingTitle={setIsEditingTitle}
            />
            {!isEditingTitle && (
              <CanvasDropdown
                activeCanvas={activeCanvas}
                canvases={canvases}
                createCanvas={createCanvas}
                isListingCanvases={isListingCanvases}
                isCreatingCanvas={isCreatingCanvas}
                isLoadingCanvas={isLoadingCanvas}
                isSavingCanvas={isSavingCanvas}
                setIsEditingTitle={setIsEditingTitle}
                setCanvasId={setCanvasId}
              />
            )}
          </Flex>
        </PreviewLinkWrapper>

        <StyledGoBackWrapper>
          <Tooltip content="Undo" position="bottom">
            <Button
              type="ghost"
              icon="Restore"
              onClick={undo.fn}
              disabled={undo.isDisabled}
              aria-label="Undo"
            />
          </Tooltip>
          <Tooltip content="Redo" position="bottom">
            <Button
              type="ghost"
              icon="Refresh"
              onClick={redo.fn}
              disabled={redo.isDisabled}
              aria-label="Redo"
            />
          </Tooltip>

          <Button onClick={onResourceSelectorOpen}>
            <Icon type="Plus" /> Add data...
          </Button>

          <Dropdown
            content={
              <Menu>
                <Menu.Item onClick={onDownloadPress}>Download as PDF</Menu.Item>
                <Menu.Item
                  hasSwitch
                  toggled={shouldShowConnectionAnnotations}
                  aria-label="Always show connection lines"
                  onChange={() => {
                    setShouldShowConnectionAnnotations(
                      !shouldShowConnectionAnnotations
                    );
                  }}
                >
                  Always show
                  <br />
                  connection lines
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon="EllipsisHorizontal" />
          </Dropdown>
        </StyledGoBackWrapper>
      </TitleRowWrapper>
      <PreviewTabWrapper onKeyDown={onKeyDown} onDrop={onDrop}>
        <IndustryCanvas
          id={APPLICATION_ID_INDUSTRY_CANVAS}
          viewerRef={unifiedViewerRef}
          onRef={setUnifiedViewerRef}
          shouldShowConnectionAnnotations={shouldShowConnectionAnnotations}
          currentZoomScale={currentZoomScale}
          applicationId={APPLICATION_ID_INDUSTRY_CANVAS}
          onAddContainerReferences={onAddContainerReferences}
          onDeleteRequest={onDeleteRequest}
          onUpdateRequest={onUpdateRequest}
          interactionState={interactionState}
          setInteractionState={setInteractionState}
          containerAnnotations={containerAnnotations}
          clickedContainerAnnotation={clickedContainerAnnotation}
          container={container}
          updateContainerById={updateContainerById}
          removeContainerById={removeContainerById}
          selectedContainer={selectedContainer}
          canvasAnnotations={canvasAnnotations}
          selectedCanvasAnnotation={selectedCanvasAnnotation}
          tool={tool}
          setTool={setTool}
          onUpdateAnnotationStyleByType={onUpdateAnnotationStyleByType}
          toolOptions={toolOptions}
        />
        <DragOverIndicator isDragging={isDragging} />
      </PreviewTabWrapper>
      <IndustryCanvasFileUploadModal
        fileDropData={fileDropData}
        onCancel={resetFileDropData}
        onOk={(fileInfo, relativePointerPosition) => {
          resetFileDropData();
          onAddContainerReferences([
            {
              type: ContainerReferenceType.FILE,
              resourceId: fileInfo.id,
              x: relativePointerPosition.x,
              y: relativePointerPosition.y,
              maxHeight: DEFAULT_CONTAINER_MAX_HEIGHT,
              maxWidth: DEFAULT_CONTAINER_MAX_WIDTH,
            },
          ]);
        }}
      />
    </>
  );
};

export const IndustryCanvasPage = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfileProvider>
        <IndustryCanvasProvider>
          <IndustryCanvasPageWithoutQueryClientProvider />
        </IndustryCanvasProvider>
      </UserProfileProvider>
    </QueryClientProvider>
  );
};

const TitleRowWrapper = styled.div`
  h1 {
    margin: 0px;
  }
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 10px 12px;
  border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
`;

const PreviewTabWrapper = styled.div`
  height: 100%;
  position: relative;
`;

const StyledGoBackWrapper = styled.div`
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
`;

const PreviewLinkWrapper = styled.div`
  overflow: hidden;
  vertical-align: bottom;
  flex: 1 1 auto;
`;
