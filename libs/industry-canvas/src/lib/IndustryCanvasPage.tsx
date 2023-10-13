import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { ResourceSelector } from '@data-exploration/containers';
import { GraphQlQueryFlow, useCopilotContext } from '@fusion/copilot-core';

import { createLink, PageTitle } from '@cognite/cdf-utilities';
import {
  Button,
  Chip,
  Colors,
  Divider,
  Dropdown,
  Flex,
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
  ZoomToFitMode,
  isAnnotation,
} from '@cognite/unified-file-viewer';

import { translationKeys } from './common';
import { ToggleButton } from './components/buttons';
import CanvasDropdown from './components/CanvasDropdown';
import { CanvasTitle } from './components/CanvasTitle';
import CanvasVisibilityModal from './components/CanvasVisibilityModal';
import { CloseResourceSelectorButton } from './components/CloseResourceSelectorButton';
import DragOverIndicator from './components/DragOverIndicator';
import IndustryCanvasFileUploadModal from './components/IndustryCanvasFileUploadModal/IndustryCanvasFileUploadModal';
import NoAccessToCurrentCanvas from './components/NoAccessToCurrentCanvas';
import SharedUsersAvatars from './components/SharedUsersAvatars/index';
import {
  CANVAS_MIN_WIDTH,
  MetricEvent,
  SEARCH_QUERY_PARAM_KEY,
  TOAST_POSITION,
  ZOOM_TO_FIT_MARGIN,
} from './constants';
import { CommentsPane } from './containers';
import { useAuth2InvitationsByResource } from './hooks/use-query/useAuth2InvitationsByResource';
import { useUsers } from './hooks/use-query/useUsers';
import { useCallbackOnce } from './hooks/useCallbackOnce';
import useCanvasVisibility from './hooks/useCanvasVisibility';
import useClickedContainerAnnotation from './hooks/useClickedContainerAnnotation';
import { useContainerAnnotations } from './hooks/useContainerAnnotations';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useLocalStorage from './hooks/useLocalStorage';
import useManagedTool from './hooks/useManagedTool';
import useNodes from './hooks/useNodes';
import useOnAddContainerReferences from './hooks/useOnAddContainerReferences';
import useOnUpdateRequest from './hooks/useOnUpdateRequest';
import useOnUpdateSelectedAnnotation from './hooks/useOnUpdateSelectedAnnotation';
import usePersistence from './hooks/usePersistence';
import { useQueryParameter } from './hooks/useQueryParameter';
import useRefocusCanvasWhenPanesClose from './hooks/useRefocusCanvasWhenPanesClose';
import { useSelectedAnnotationOrContainer } from './hooks/useSelectedAnnotationOrContainer';
import useSyncCurrentZoomScale from './hooks/useSyncCurrentZoomScale';
import { useTooltipsOptions } from './hooks/useTooltipsOptions';
import useTrackCanvasViewed from './hooks/useTrackCanvasViewed';
import { useTranslation } from './hooks/useTranslation';
import resolveGqlToFdmInstanceContainerReferences from './hooks/utils/resolveGqlToFdmInstanceContainerReferences';
import { IndustryCanvas } from './IndustryCanvas';
import { useIndustryCanvasContext } from './IndustryCanvasContext';
import { useListCommentsQuery } from './services/comments/hooks';
import { CommentTargetType } from './services/comments/types';
import { createCommentAnnotation } from './services/comments/utils';
import { CanvasVisibility } from './services/IndustryCanvasService';
import {
  closeCommentsPane,
  closeResourceSelector,
  openResourceSelector,
  setShouldShowConnectionAnnotations,
  setToolType,
  toggleCommentsPane,
  undo,
  redo,
  useIndustrialCanvasStore,
  selectors,
  shamefulResetState,
  setFileUploadData,
} from './state/useIndustrialCanvasStore';
import {
  ContainerReference,
  ContainerReferenceType,
  IndustryCanvasToolType,
  isIndustryCanvasContainerConfig,
} from './types';
import { useUserProfile } from './UserProfileProvider';
import { createDuplicateCanvas } from './utils/createDuplicateCanvas';
import {
  DEFAULT_CONTAINER_MAX_HEIGHT,
  DEFAULT_CONTAINER_MAX_WIDTH,
} from './utils/dimensions';
import { getCanvasLink } from './utils/getCanvasLink';
import isSupportedResourceItem from './utils/isSupportedResourceItem';
import resourceItemToContainerReference from './utils/resourceItemToContainerReference';
import useMetrics from './utils/tracking/useMetrics';

export type OnAddContainerReferences = (
  containerReferences: ContainerReference[]
) => void;

const APPLICATION_ID_INDUSTRY_CANVAS = 'industryCanvas';
const DEFAULT_RIGHT_SIDE_PANEL_WIDTH = 700;

export const IndustryCanvasPage = () => {
  const sdk = useSDK();
  const trackUsage = useMetrics();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [unifiedViewerRef, setUnifiedViewerRef] =
    useState<UnifiedViewer | null>(null);
  const {
    shouldShowConnectionAnnotations,
    isCommentsPaneOpen,
    isResourceSelectorOpen,
    resourceSelectorProps,
    isUndoAvailable,
    isRedoAvailable,
    canvasState,
    clickedContainerAnnotationId,
    fileUploadData,
  } = useIndustrialCanvasStore((state) => ({
    shouldShowConnectionAnnotations: state.shouldShowConnectionAnnotations,
    isCommentsPaneOpen: state.isCommentsPaneOpen,
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    resourceSelectorProps: state.resourceSelectorProps,
    isUndoAvailable: selectors.isUndoAvailable(state),
    isRedoAvailable: selectors.isRedoAvailable(state),
    canvasState: selectors.canvasState(state),
    clickedContainerAnnotationId:
      state.interactionState.clickedContainerAnnotationId,
    fileUploadData: state.fileUploadData,
  }));

  useEffect(() => {
    return () => {
      // On unmount, we reset the state, otherwise when revisiting another canvas,
      // the state will be the same as the previous canvas for a small period.
      // This will be fixed in a better way in the near future
      shamefulResetState();
    };
  }, []);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { tooltipsOptions, onUpdateTooltipsOptions } = useTooltipsOptions();
  const { toolType, tool, updateStyleForToolType } = useManagedTool();
  const { queryString } = useQueryParameter({ key: SEARCH_QUERY_PARAM_KEY });
  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_INDUSTRIAL_CANVAS_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );
  const [hasZoomedToFitOnInitialLoad, setHasZoomedToFitOnInitialLoad] =
    useState(false);
  const { userProfile } = useUserProfile();
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
  } = useIndustryCanvasContext();

  const { comments, isLoading: isCommentsLoading } = useListCommentsQuery({
    targetId: activeCanvas?.externalId,
    targetType: CommentTargetType.CANVAS,
  });

  const { data: users = [] } = useUsers();
  usePersistence(canvasState);
  const onUpdateRequest = useOnUpdateRequest({
    unifiedViewer: unifiedViewerRef,
  });

  const nodes = useNodes(canvasState);
  const containers = useMemo(
    () => nodes.filter(isIndustryCanvasContainerConfig),
    [nodes]
  );
  const canvasAnnotations = useMemo(() => nodes.filter(isAnnotation), [nodes]);
  const containerAnnotations = useContainerAnnotations({
    containers,
  });
  const clickedContainerAnnotation = useClickedContainerAnnotation({
    containerAnnotations,
    clickedContainerAnnotationId,
  });
  useTrackCanvasViewed(activeCanvas);

  const { invitationsByResource, isFetched: isInvitationsByResourceFetched } =
    useAuth2InvitationsByResource({
      externalId: activeCanvas?.externalId,
    });
  const isUserProfileInvitedToCanvas = invitationsByResource.some(
    (invitedUser) => invitedUser.userIdentifier === userProfile.userIdentifier
  );
  const canCurrentUserSeeCanvas =
    activeCanvas && isInvitationsByResourceFetched
      ? activeCanvas.visibility === CanvasVisibility.PUBLIC ||
        userProfile.userIdentifier === activeCanvas.createdBy ||
        isUserProfileInvitedToCanvas
      : true;

  // if comments is not enabled then return empty, hiding all comments for that project (even if canvas had comments before)
  const commentAnnotations = useMemo(
    () =>
      comments
        .filter((comment) => comment.targetContext !== undefined)
        .map((comment) => createCommentAnnotation(comment)),
    [comments]
  );

  const {
    selectedCanvas: selectedCanvasForVisibility,
    setSelectedCanvas: setSelectedCanvasForVisibility,
  } = useCanvasVisibility();

  // Here we need an extra state to not show modal initally when go to canvas page.
  const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
  useEffect(() => {
    // This is to update selected canvas for modal when the visibility is updated in the modal.
    if (visibilityModalOpen) {
      setSelectedCanvasForVisibility(activeCanvas);
    }
  }, [activeCanvas, setSelectedCanvasForVisibility, visibilityModalOpen]);

  useEffect(() => {
    if (isCanvasLocked && toolType !== IndustryCanvasToolType.PAN) {
      setToolType(IndustryCanvasToolType.PAN);
    }
  }, [isCanvasLocked, toolType]);

  const { selectedCanvasAnnotation, selectedContainers } =
    useSelectedAnnotationOrContainer({
      unifiedViewerRef,
      canvasAnnotations,
      containers,
    });

  const { onUpdateSelectedAnnotation } = useOnUpdateSelectedAnnotation({
    updateStyleForToolType,
    selectedCanvasAnnotation,
    onUpdateRequest,
  });

  const { isDragging, onDrop } = useDragAndDrop({
    unifiedViewerRef: unifiedViewerRef,
  });

  useSyncCurrentZoomScale(unifiedViewerRef);

  const onAddContainerReferences = useOnAddContainerReferences({
    unifiedViewerRef,
    selectedContainers,
    clickedContainerAnnotation,
    containers,
    isCanvasLocked,
    tooltipsOptions,
  });

  const { registerFlow } = useCopilotContext();
  const flow = useMemo(() => new GraphQlQueryFlow({ sdk }), [sdk]);

  useEffect(() => {
    const unregister = registerFlow({
      flow,
      messageActions: {
        'data-model-query': (message) => [
          {
            content: 'Add to canvas',
            onClick: () => {
              resolveGqlToFdmInstanceContainerReferences(sdk, message).then(
                (containerReferences) =>
                  onAddContainerReferences(containerReferences)
              );
            },
          },
        ],
      },
    });
    return () => unregister();
  }, [registerFlow, flow, sdk, onAddContainerReferences]);

  // useCopilotGqlResolver(sdk, onAddContainerReferences);

  useRefocusCanvasWhenPanesClose({ unifiedViewerRef });

  useEffect(() => {
    if (unifiedViewerRef === null || hasZoomedToFitOnInitialLoad) {
      return;
    }

    if (containers.length === 0) {
      return;
    }

    unifiedViewerRef.zoomToFit(ZoomToFitMode.NATURAL, {
      relativeMargin: ZOOM_TO_FIT_MARGIN,
      duration: 0,
    });
    setHasZoomedToFitOnInitialLoad(true);
  }, [hasZoomedToFitOnInitialLoad, unifiedViewerRef, containers]);

  const { onKeyDown, onKeyUp } = useKeyboardShortcuts(unifiedViewerRef);

  const handleGoBackToIndustryCanvasButtonClick = () => {
    navigate(
      createLink('/industrial-canvas', {
        [SEARCH_QUERY_PARAM_KEY]: queryString,
      })
    );
  };

  const onDownloadPress = () => {
    if (activeCanvas === undefined) {
      return;
    }
    unifiedViewerRef?.exportWorkspaceToPdf({
      fileName: `${activeCanvas.name}.pdf`,
      pages: containers.map(({ id: containerId }) => ({ containerId })),
    });
    trackUsage(MetricEvent.DOWNLOAD_AS_PDF_CLICKED);
  };

  const onAddResourcePress = async (
    results?: ResourceItem | ResourceItem[]
  ) => {
    console.log('ICP; selection results: ', results);
    if (isCanvasLocked) {
      return;
    }

    closeResourceSelector();
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

  const handleDuplicateCanvasClick = useCallbackOnce(async () => {
    if (activeCanvas === undefined) {
      return;
    }

    const { externalId } = await createDuplicateCanvas({
      canvas: activeCanvas,
      createCanvas,
      t,
    });

    navigate(getCanvasLink(externalId));
  });

  if (!canCurrentUserSeeCanvas) {
    return (
      <NoAccessToCurrentCanvas
        onGoBackClick={handleGoBackToIndustryCanvasButtonClick}
      />
    );
  }

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
                aria-label={t(
                  translationKeys.CANVAS_VISIBILITY_ERROR_BUTTON,
                  'Go to Industrial Canvas home page'
                )}
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
              onClick={undo}
              disabled={isCanvasLocked || !isUndoAvailable}
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
              onClick={redo}
              disabled={isCanvasLocked || !isRedoAvailable}
              aria-label={t(translationKeys.CANVAS_REDO, 'Redo')}
            />
          </Tooltip>
          <Divider direction="vertical" length="20px" endcap="round" />
          <Button
            type="primary"
            disabled={isCanvasLocked || isResourceSelectorOpen}
            aria-label="Add data"
            onClick={() => {
              openResourceSelector();
              trackUsage(MetricEvent.ADD_DATA_BUTTON_CLICKED);
            }}
            icon="Add"
          >
            {t(translationKeys.CANVAS_ADD_RESOURCE_BUTTON, 'Add data')}
          </Button>

          <Divider direction="vertical" length="20px" endcap="round" />

          <SharedUsersAvatars users={[userProfile, ...invitationsByResource]} />

          <Button
            type="secondary"
            aria-label="Share canvas"
            onClick={() => {
              setSelectedCanvasForVisibility(activeCanvas);
              setVisibilityModalOpen(true);
            }}
            icon="Share"
          >
            {t(translationKeys.CANVAS_SHARE_BUTTON, 'Share')}
          </Button>

          <Divider direction="vertical" length="20px" endcap="round" />

          <ToggleButton
            toggled={isCommentsPaneOpen}
            icon="Comments"
            onClick={toggleCommentsPane}
            aria-label={t(
              translationKeys.CANVAS_OPEN_COMMENTS_PANE,
              'Open comments pane'
            )}
            tooltipContent={t(
              translationKeys.CANVAS_OPEN_COMMENTS_PANE,
              'Open comments pane'
            )}
            tooltipPosition="bottom"
          />
          <Divider direction="vertical" length="20px" endcap="round" />

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
                <Menu.Item
                  onClick={handleDuplicateCanvasClick}
                  disabled={isCreatingCanvas}
                >
                  {t(
                    translationKeys.COMMON_CANVAS_MAKE_COPY,
                    'Duplicate canvas'
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
        secondaryInitialSize={rightSidePanelWidth}
        onSecondaryPaneSizeChange={setRightSidePanelWidth}
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
            applicationId={APPLICATION_ID_INDUSTRY_CANVAS}
            onAddContainerReferences={onAddContainerReferences}
            onUpdateRequest={onUpdateRequest}
            containerAnnotations={containerAnnotations}
            clickedContainerAnnotation={clickedContainerAnnotation}
            nodes={nodes}
            selectedContainers={selectedContainers}
            selectedCanvasAnnotation={selectedCanvasAnnotation}
            tool={tool}
            toolType={toolType}
            onUpdateSelectedAnnotation={onUpdateSelectedAnnotation}
            isCanvasLocked={isCanvasLocked}
            commentAnnotations={commentAnnotations}
            comments={comments}
            tooltipsOptions={tooltipsOptions}
            onUpdateTooltipsOptions={onUpdateTooltipsOptions}
          />

          <CloseResourceSelectorButton
            isVisible={isResourceSelectorOpen}
            onClick={closeResourceSelector}
          />

          <DragOverIndicator isDragging={isDragging} />
        </IndustryCanvasWrapper>

        {isResourceSelectorOpen && (
          <ResourceSelector
            onSelect={onAddResourcePress}
            visibleResourceTabs={[
              // 'charts', // this should be commented until feature becomes ready.
              'file',
              'timeSeries',
              'asset',
              'event',
            ]}
            selectionMode="multiple"
            initialFilter={resourceSelectorProps?.initialFilter}
            initialTab={resourceSelectorProps?.initialTab}
            initialSelectedResource={
              resourceSelectorProps?.initialSelectedResourceItem
            }
            addButtonText="Add to canvas"
            shouldShowPreviews={false}
            shouldOnlyShowPreviewPane={
              resourceSelectorProps?.shouldOnlyShowPreviewPane
            }
          />
        )}
        {!isResourceSelectorOpen && isCommentsPaneOpen && (
          <CommentsPane
            users={users}
            comments={comments}
            isLoading={isCommentsLoading}
            onCloseCommentsPane={closeCommentsPane}
          />
        )}
      </StyledSplitter>
      <IndustryCanvasFileUploadModal
        fileUploadData={fileUploadData}
        onCancel={() => setFileUploadData(null)}
        onOk={(fileInfo, relativePointerPosition) => {
          setFileUploadData(null);
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
      <CanvasVisibilityModal
        canvas={selectedCanvasForVisibility}
        onCancel={() => {
          setSelectedCanvasForVisibility(undefined);
          setVisibilityModalOpen(false);
        }}
        saveCanvas={saveCanvas}
        isSavingCanvas={isSavingCanvas}
        userProfile={userProfile}
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
  height: 100%;
  gap: 8px;
`;

const PreviewLinkWrapper = styled.div`
  overflow: hidden;
  vertical-align: bottom;
  flex: 1 1 auto;
`;
