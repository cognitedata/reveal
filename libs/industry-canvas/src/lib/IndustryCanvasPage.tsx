import { PageTitle } from '@cognite/cdf-utilities';
import { Button, Flex, Tooltip, Icon, Colors, toast } from '@cognite/cogs.js';
import {
  isNotUndefined,
  ResourceIcons,
  ResourceItem,
  useResourceSelector,
} from '@cognite/data-exploration';
import {
  ToolType,
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';
import { useSDK } from '@cognite/sdk-provider';
import { v4 as uuid } from 'uuid';
import { EMPTY_FLEXIBLE_LAYOUT } from './hooks/constants';

import { IndustryCanvas } from './IndustryCanvas';
import styled from 'styled-components';
import { TOAST_POSITION } from './constants';
import { useState, useEffect, KeyboardEventHandler, useCallback } from 'react';
import useManagedState from './hooks/useManagedState';
import useManagedTools from './hooks/useManagedTools';
import { CanvasTitle } from './components/CanvasTitle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CanvasDropdown from './components/CanvasDropdown';
import {
  IndustryCanvasProvider,
  useIndustryCanvasContext,
} from './IndustryCanvasContext';
import { ContainerReference } from './types';
import isSupportedResourceItem from './utils/isSupportedResourceItem';
import resourceItemToContainerReference from './utils/resourceItemToContainerReference';
import { useSelectedAnnotationOrContainer } from './hooks/useSelectedAnnotationOrContainer';

const APPLICATION_ID_INDUSTRY_CANVAS = 'industryCanvas';

const IndustryCanvasPageWithoutQueryClientProvider = () => {
  const [unifiedViewerRef, setUnifiedViewerRef] =
    useState<UnifiedViewer | null>(null);
  const { openResourceSelector } = useResourceSelector();
  const [currentZoomScale, setCurrentZoomScale] = useState<number>(1);
  const [
    hasConsumedInitializeWithContainerReferences,
    setHasConsumedInitializeWithContainerReferences,
  ] = useState(false);

  const [tool, setTool] = useState<ToolType>(ToolType.SELECT);

  const sdk = useSDK();
  const {
    activeCanvas,
    canvases,
    isCreatingCanvas,
    isSavingCanvas,
    isLoadingCanvas,
    isListingCanvases,
    isArchivingCanvas,
    archiveCanvas,
    saveCanvas,
    createCanvas,
    initializeWithContainerReferences,
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
    interactionState,
    setInteractionState,
  } = useManagedState({
    unifiedViewer: unifiedViewerRef,
    setTool,
  });

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

  const onAddContainerReferences = useCallback(
    (containerReferences: ContainerReference[]) => {
      addContainerReferences(containerReferences);
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
    [addContainerReferences]
  );

  const onAddResourcePress = () => {
    openResourceSelector({
      resourceTypes: ['file', 'timeSeries', 'asset', 'event'],
      selectionMode: 'multiple',
      onSelect: () => {
        // It's a required prop, but we don't really want to do anything on
        // select.
        return undefined;
      },
      onClose: async (confirmed: boolean, results?: ResourceItem[]) => {
        if (!confirmed) {
          // Selector closed for other reasons than selecting resources
          return;
        }

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
      },
    });
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

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      if (event.shiftKey) {
        redo.fn();
        return;
      }
      undo.fn();
      return;
    }
  };

  return (
    <>
      <PageTitle title="Industry Canvas" />
      <TitleRowWrapper>
        <PreviewLinkWrapper>
          <Flex alignItems="center">
            <ResourceIcons type="file" style={{ marginRight: '5px' }} />
            <CanvasTitle activeCanvas={activeCanvas} saveCanvas={saveCanvas} />
            <Button
              aria-label="CreateCanvasButton"
              size="medium"
              type="primary"
              icon="Plus"
              loading={isCreatingCanvas || isSavingCanvas || isLoadingCanvas}
              style={{ marginLeft: '10px' }}
              onClick={() => {
                createCanvas({
                  canvasAnnotations: [],
                  container: EMPTY_FLEXIBLE_LAYOUT,
                });
              }}
            >
              Create new canvas
            </Button>
            <CanvasDropdown
              activeCanvas={activeCanvas}
              canvases={canvases}
              archiveCanvas={archiveCanvas}
              isArchivingCanvas={isArchivingCanvas}
              isListingCanvases={isListingCanvases}
            />
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

          <Button onClick={onAddResourcePress}>
            <Icon type="Plus" /> Add data...
          </Button>

          <Tooltip content="Download canvas as PDF" position="bottom">
            <Button
              icon="Download"
              aria-label="Download"
              onClick={onDownloadPress}
            />
          </Tooltip>
        </StyledGoBackWrapper>
      </TitleRowWrapper>
      <PreviewTabWrapper onKeyDown={onKeyDown}>
        <IndustryCanvas
          id={APPLICATION_ID_INDUSTRY_CANVAS}
          viewerRef={unifiedViewerRef}
          onRef={setUnifiedViewerRef}
          currentZoomScale={currentZoomScale}
          applicationId={APPLICATION_ID_INDUSTRY_CANVAS}
          onAddContainerReferences={onAddContainerReferences}
          onDeleteRequest={onDeleteRequest}
          onUpdateRequest={onUpdateRequest}
          interactionState={interactionState}
          setInteractionState={setInteractionState}
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
      </PreviewTabWrapper>
    </>
  );
};

export const IndustryCanvasPage = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <IndustryCanvasProvider>
        <IndustryCanvasPageWithoutQueryClientProvider />
      </IndustryCanvasProvider>
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
