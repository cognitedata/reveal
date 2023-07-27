import {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { ResourceSelector } from '@data-exploration/containers';
import { v4 as uuid } from 'uuid';

import { createLink, PageTitle } from '@cognite/cdf-utilities';
import {
  Button,
  Chip,
  Colors,
  Dropdown,
  Flex,
  Icon,
  Menu,
  toast,
  Tooltip,
} from '@cognite/cogs.js';
import {
  isNotUndefined,
  ResourceItem,
  Splitter,
} from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';
import {
  UnifiedViewer,
  UnifiedViewerEventType,
  ZoomToFitMode,
} from '@cognite/unified-file-viewer';

import { translationKeys } from './common';
import CanvasDropdown from './components/CanvasDropdown';
import { CanvasTitle } from './components/CanvasTitle';
import { CloseResourceSelectorButton } from './components/CloseResourceSelectorButton';
import DragOverIndicator from './components/DragOverIndicator';
import IndustryCanvasFileUploadModal from './components/IndustryCanvasFileUploadModal/IndustryCanvasFileUploadModal';
import {
  CANVAS_MIN_WIDTH,
  MetricEvent,
  SEARCH_QUERY_PARAM_KEY,
  SHAMEFUL_WAIT_TO_ENSURE_CONTAINERS_ARE_RENDERED_MS,
  TOAST_POSITION,
  ZOOM_TO_FIT_MARGIN,
} from './constants';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import useLocalStorage from './hooks/useLocalStorage';
import useManagedState from './hooks/useManagedState';
import useManagedTool from './hooks/useManagedTool';
import useOnUpdateSelectedAnnotation from './hooks/useOnUpdateSelectedAnnotation';
import { useQueryParameter } from './hooks/useQueryParameter';
import { useResourceSelectorActions } from './hooks/useResourceSelectorActions';
import { useSelectedAnnotationOrContainer } from './hooks/useSelectedAnnotationOrContainer';
import { useTooltipsOptions } from './hooks/useTooltipsOptions';
import useTrackCanvasViewed from './hooks/useTrackCanvasViewed';
import { useTranslation } from './hooks/useTranslation';
import { IndustryCanvas } from './IndustryCanvas';
import { useIndustryCanvasContext } from './IndustryCanvasContext';
import {
  ContainerReference,
  ContainerReferenceType,
  IndustryCanvasToolType,
  isCommentAnnotation,
} from './types';
import {
  DEFAULT_CONTAINER_MAX_HEIGHT,
  DEFAULT_CONTAINER_MAX_WIDTH,
} from './utils/dimensions';
import enforceTimeseriesApplyToAllIfEnabled from './utils/enforceTimeseriesApplyToAllIfEnabled';
import isSupportedResourceItem from './utils/isSupportedResourceItem';
import resourceItemToContainerReference from './utils/resourceItemToContainerReference';
import useMetrics from './utils/tracking/useMetrics';
import { zoomToFitAroundContainerIds } from './utils/zoomToFitAroundContainerIds';

export type OnAddContainerReferences = (
  containerReferences: ContainerReference[]
) => void;

const APPLICATION_ID_INDUSTRY_CANVAS = 'industryCanvas';

export const IndustryCanvasPage = () => {
  const trackUsage = useMetrics();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [unifiedViewerRef, setUnifiedViewerRef] =
    useState<UnifiedViewer | null>(null);
  const [shouldShowConnectionAnnotations, setShouldShowConnectionAnnotations] =
    useState<boolean>(true);
  const [currentZoomScale, setCurrentZoomScale] = useState<number>(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { tooltipsOptions, onUpdateTooltipsOptions } = useTooltipsOptions();
  const { toolType, setToolType, tool, updateStyleForToolType } =
    useManagedTool(IndustryCanvasToolType.SELECT);
  const toolBeforeSpacePress = useRef<IndustryCanvasToolType | undefined>(
    undefined
  );
  const { queryString } = useQueryParameter({ key: SEARCH_QUERY_PARAM_KEY });
  const [resourceSelectorWidth, setResourceSelectorWidth] = useLocalStorage(
    'COGNITE_INDUSTRIAL_CANVAS_RESOURCE_SELECTOR_WIDTH',
    700
  );

  const [hasZoomedToFitOnInitialLoad, setHasZoomedToFitOnInitialLoad] =
    useState(false);

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
    setCanvasId,
    isCanvasLocked,
    isCommentsEnabled,
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
    toolType,
    setToolType,
  });

  useTrackCanvasViewed(activeCanvas);

  // if comments is not enabled then return empty, hiding all comments for that project (even if canvas had comments before)
  const commentAnnotations = useMemo(
    () =>
      isCommentsEnabled ? canvasAnnotations.filter(isCommentAnnotation) : [],
    [isCommentsEnabled, canvasAnnotations]
  );

  useEffect(() => {
    if (isCanvasLocked && toolType !== IndustryCanvasToolType.PAN) {
      setToolType(IndustryCanvasToolType.PAN);
    }
  }, [isCanvasLocked, setToolType, toolType]);

  const { selectedCanvasAnnotation, selectedContainer } =
    useSelectedAnnotationOrContainer({
      unifiedViewerRef,
      toolType,
      canvasAnnotations,
      container,
    });

  const {
    onResourceSelectorClose,
    onResourceSelectorOpen,
    isResourceSelectorOpen,
    resourceSelectorFilter,
    initialSelectedResource,
    initialTab,
  } = useResourceSelectorActions();

  const { onUpdateSelectedAnnotation } = useOnUpdateSelectedAnnotation({
    updateStyleForToolType,
    selectedCanvasAnnotation,
    onUpdateRequest,
  });

  const { fileDropData, resetFileDropData, isDragging, onDrop } =
    useDragAndDrop({
      unifiedViewerRef: unifiedViewerRef,
    });

  const onDownloadPress = () => {
    unifiedViewerRef?.exportWorkspaceToPdf();
    trackUsage(MetricEvent.DOWNLOAD_AS_PDF_CLICKED);
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

      if (isCanvasLocked) {
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
            <h4>
              {t(
                translationKeys.CANVAS_ADD_RESOURCE_ERROR_TITLE,
                'Could not add resource(s) to your canvas'
              )}
            </h4>
            <p>
              {t(
                translationKeys.CANVAS_ADD_RESOURCE_ERROR_MESSAGE,
                'At least one resource needs to be selected.'
              )}
            </p>
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

      addContainerReferences(
        enforceTimeseriesApplyToAllIfEnabled(
          tooltipsOptions,
          containerReferencesToAdd
        )
      ).then((containers) => {
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
          <h4>
            {t(
              translationKeys.CANVAS_RESOURCES_ADDED,
              'Resource(s) added to your canvas'
            )}
          </h4>
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
      isCanvasLocked,
      t,
      tooltipsOptions,
    ]
  );

  const onResourceSelectorCloseWrapper = () => {
    onResourceSelectorClose();
    // Put focus back on the canvas element right after a container has been
    // added, so that the user may immediately perform actions on them. For
    // example, delete the added container references by using the backspace
    // key
    unifiedViewerRef?.stage?.container().focus();
  };

  const onAddResourcePress = async (
    results?: ResourceItem | ResourceItem[]
  ) => {
    if (isCanvasLocked) {
      return;
    }

    onResourceSelectorCloseWrapper();
    if (results && Array.isArray(results)) {
      if (unifiedViewerRef === null) {
        return;
      }

      if (results === undefined || results.length === 0) {
        toast.error(
          <div>
            <h4>
              {t(
                translationKeys.CANVAS_ADD_RESOURCE_ERROR_TITLE,
                'Could not add resource(s) to your canvas'
              )}
            </h4>
            <p>
              {t(
                translationKeys.CANVAS_ADD_RESOURCE_ERROR_TITLE,
                'At least one resource needs to be selected.'
              )}
            </p>
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

      const numberOfResourcesPerType = supportedResourceItems.reduce(
        (acc, resourceItem) => {
          const type = resourceItem.type;
          acc[type] = (acc[type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      trackUsage(MetricEvent.RESOURCE_SELECTOR_RESOURCES_ADDED, {
        numberOfResources: supportedResourceItems.length,
        numberOfResourcesPerType,
      });
    }
  };

  useEffect(() => {
    if (unifiedViewerRef === null || hasZoomedToFitOnInitialLoad) {
      return;
    }

    if (container.children === undefined || container.children.length === 0) {
      return;
    }

    unifiedViewerRef.zoomToFit(ZoomToFitMode.NATURAL, {
      relativeMargin: ZOOM_TO_FIT_MARGIN,
      duration: 0,
    });
    setHasZoomedToFitOnInitialLoad(true);
  }, [hasZoomedToFitOnInitialLoad, unifiedViewerRef, container]);

  const onKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      if (event.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        redo.fn();
        trackUsage(MetricEvent.HOTKEYS_USED, {
          hotkey: 'Ctrl/Cmd + Shift + Z',
        });
        return;
      }

      event.stopPropagation();
      event.preventDefault();
      undo.fn();
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + Z',
      });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + F',
      });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.stopPropagation();
      event.preventDefault();
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + S',
      });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.stopPropagation();
      event.preventDefault();
      trackUsage(MetricEvent.HOTKEYS_USED, {
        hotkey: 'Ctrl/Cmd + A',
      });
      return;
    }

    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      unifiedViewerRef?.selectByIds({
        containerIds: [],
        annotationIds: [],
      });
      return;
    }

    if (event.key === ' ') {
      // Only record the previous tool *before* the space key was pressed.
      // Otherwise, we will record the tool while space is being pressed
      if (toolBeforeSpacePress.current === undefined) {
        toolBeforeSpacePress.current = toolType;
      }
      setToolType(IndustryCanvasToolType.PAN);
    }
  };

  const onKeyUp: KeyboardEventHandler<HTMLElement> = (event) => {
    if (event.key === ' ' && toolBeforeSpacePress.current !== undefined) {
      setToolType(toolBeforeSpacePress.current);
      toolBeforeSpacePress.current = undefined;
    }
  };

  const handleGoBackToIndustryCanvasButtonClick = () => {
    navigate(
      createLink('/industrial-canvas', {
        [SEARCH_QUERY_PARAM_KEY]: queryString,
      })
    );
  };

  return (
    <>
      <PageTitle title="Industrial Canvas" />
      <TitleRowWrapper>
        <PreviewLinkWrapper>
          <Flex alignItems="center">
            <Tooltip
              content={t(
                translationKeys.GO_BACK_HOMEPAGE_BUTTON,
                'Go back to Industrial Canvas home page'
              )}
              position="bottom"
            >
              <Button
                icon="ArrowLeft"
                aria-label="Go back to Industrial Canvas home page"
                onClick={handleGoBackToIndustryCanvasButtonClick}
              />
            </Tooltip>
            <CanvasTitle
              activeCanvas={activeCanvas}
              saveCanvas={saveCanvas}
              isEditingTitle={isEditingTitle}
              setIsEditingTitle={setIsEditingTitle}
              isCanvasLocked={isCanvasLocked}
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
                isCanvasLocked={isCanvasLocked}
              />
            )}
          </Flex>
        </PreviewLinkWrapper>

        <StyledGoBackWrapper>
          {isCanvasLocked && (
            <Chip
              type="warning"
              icon="Lock"
              label={t(translationKeys.CANVAS_LOCKED_CHIP, 'Canvas locked')}
              tooltipProps={{
                content: (
                  <>
                    {t(
                      translationKeys.CANVAS_LOCKED_REASON,
                      'The canvas is locked until your colleague has finished editing.'
                    )}
                    <br />
                    {t(
                      translationKeys.CANVAS_LOCKED_FUTURE,
                      'Real-time collaboration will be part of a future release.'
                    )}
                  </>
                ),
                position: 'bottom',
              }}
            />
          )}
          <Tooltip
            content={t(translationKeys.CANVAS_UNDO, 'Undo')}
            position="bottom"
          >
            <Button
              type="ghost"
              icon="Restore"
              onClick={undo.fn}
              disabled={isCanvasLocked || undo.isDisabled}
              aria-label={t(translationKeys.CANVAS_UNDO, 'Undo')}
            />
          </Tooltip>
          <Tooltip
            content={t(translationKeys.CANVAS_REDO, 'Redo')}
            position="bottom"
          >
            <Button
              type="ghost"
              icon="Refresh"
              onClick={redo.fn}
              disabled={isCanvasLocked || redo.isDisabled}
              aria-label={t(translationKeys.CANVAS_REDO, 'Redo')}
            />
          </Tooltip>

          <Button
            type="primary"
            disabled={isCanvasLocked || isResourceSelectorOpen}
            aria-label="Add data"
            onClick={() => {
              onResourceSelectorOpen();
              trackUsage(MetricEvent.ADD_DATA_BUTTON_CLICKED);
            }}
          >
            <Icon type="Plus" />
            {t(translationKeys.CANVAS_ADD_RESOURCE_BUTTON, 'Add data')}
          </Button>

          <Dropdown
            content={
              <Menu>
                <Menu.Item onClick={onDownloadPress}>
                  {t(translationKeys.CANVAS_DOWNLOAD_PDF, 'Download as PDF')}
                </Menu.Item>
                <Menu.Item
                  hasSwitch
                  toggled={shouldShowConnectionAnnotations}
                  aria-label={t(
                    translationKeys.SHOW_CONNECTION_LINES_SWITCH,
                    'Always show connection lines'
                  )}
                  onChange={() => {
                    const nextValue = !shouldShowConnectionAnnotations;
                    setShouldShowConnectionAnnotations(nextValue);

                    trackUsage(MetricEvent.SHOW_CONNECTION_LINES_TOGGLED, {
                      newValue: nextValue,
                    });
                  }}
                >
                  {t(
                    translationKeys.SHOW_CONNECTION_LINES_SWITCH,
                    'Always show connection lines'
                  )}
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon="EllipsisHorizontal" aria-label="More options" />
          </Dropdown>
        </StyledGoBackWrapper>
      </TitleRowWrapper>
      <StyledSplitter
        primaryMinSize={CANVAS_MIN_WIDTH}
        secondaryInitialSize={resourceSelectorWidth}
        onSecondaryPaneSizeChange={setResourceSelectorWidth}
        primaryIndex={0}
      >
        <IndustryCanvasWrapper
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onDrop={onDrop}
        >
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
            toolType={toolType}
            setToolType={setToolType}
            onUpdateSelectedAnnotation={onUpdateSelectedAnnotation}
            isCanvasLocked={isCanvasLocked}
            onResourceSelectorOpen={onResourceSelectorOpen}
            commentAnnotations={commentAnnotations}
            tooltipsOptions={tooltipsOptions}
            onUpdateTooltipsOptions={onUpdateTooltipsOptions}
          />

          <CloseResourceSelectorButton
            isVisible={isResourceSelectorOpen}
            onClick={onResourceSelectorCloseWrapper}
          />

          <DragOverIndicator isDragging={isDragging} />
        </IndustryCanvasWrapper>

        {isResourceSelectorOpen && (
          <ResourceSelector
            onSelect={onAddResourcePress}
            visibleResourceTabs={['file', 'timeSeries', 'asset', 'event']}
            selectionMode="multiple"
            initialFilter={resourceSelectorFilter}
            initialTab={initialTab}
            initialSelectedResource={initialSelectedResource}
            addButtonText="Add to canvas"
            shouldShowPreviews={false}
          />
        )}
      </StyledSplitter>
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

const TITlE_ROW_HEIGHT = 57;
const TitleRowWrapper = styled.div`
  h1 {
    margin: 0px;
  }
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 10px 12px;
  height: ${TITlE_ROW_HEIGHT}px;
  border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
`;

const StyledSplitter = styled(Splitter)`
  height: calc(100% - ${TITlE_ROW_HEIGHT}px);
`;

const IndustryCanvasWrapper = styled.div`
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
