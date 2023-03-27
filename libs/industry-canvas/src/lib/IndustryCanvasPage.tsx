import { PageTitle } from '@cognite/cdf-utilities';
import {
  Button,
  Title,
  Flex,
  Tooltip,
  Icon,
  Colors,
  toast,
} from '@cognite/cogs.js';
import {
  isNotUndefined,
  ResourceIcons,
  ResourceItem,
  useResourceSelector,
} from '@cognite/data-exploration';
import {
  ContainerType,
  isSupportedFileInfo,
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';
import { useSDK } from '@cognite/sdk-provider';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

import { IndustryCanvas } from './IndustryCanvas';
import { useIndustryCanvasAddContainerReferences } from './hooks/useIndustryCanvasAddContainerReferences';
import styled from 'styled-components';
import { TOAST_POSITION } from './constants';
import {
  ContainerReferenceType,
  ContainerReferenceWithoutDimensions,
} from './types';
import { useState, useEffect } from 'react';
import useManagedState from './hooks/useManagedState';
import { clearCanvasState } from './utils/utils';

const APPLICATION_ID_INDUSTRY_CANVAS = 'industryCanvas';

export const IndustryCanvasPage = () => {
  const [unifiedViewerRef, setUnifiedViewerRef] =
    useState<UnifiedViewer | null>(null);
  const { openResourceSelector } = useResourceSelector();
  const [currentZoomScale, setCurrentZoomScale] = useState<number>(1);

  const {
    container,
    setContainer,
    canvasAnnotations,
    containerReferences,
    addContainerReferences,
    updateContainerReference,
    removeContainerReference,
    onDeleteRequest,
    onUpdateRequest,
    interactionState,
    setInteractionState,
  } = useManagedState({
    container: {
      id: 'flexible-layout-container',
      type: ContainerType.FLEXIBLE_LAYOUT,
      children: [],
    },
  });

  const onAddContainerReferences = useIndustryCanvasAddContainerReferences({
    unifiedViewer: unifiedViewerRef,
    addContainerReferences,
  });
  const sdk = useSDK();

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

  const onAddResourcePress = () => {
    openResourceSelector({
      resourceTypes: ['file', 'timeSeries', 'asset'],
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
              if (resourceItem.type === 'file') {
                const fileInfo = await sdk.files.retrieve([
                  { id: resourceItem.id },
                ]);

                if (isSupportedFileInfo(fileInfo[0])) {
                  return resourceItem;
                }

                return undefined;
              }

              return resourceItem;
            })
          )
        ).filter(isNotUndefined);

        if (supportedResourceItems.length === 0) {
          // TODO: Improve messaging if selected resources are not supported
          return;
        }

        const containerReferencesToAdd: ContainerReferenceWithoutDimensions[] =
          supportedResourceItems.map((supportedResourceItem) => {
            if (supportedResourceItem.type === 'timeSeries') {
              return {
                type: ContainerReferenceType.TIMESERIES,
                id: uuid(),
                resourceId: supportedResourceItem.id,
                startDate: dayjs(new Date())
                  .subtract(2, 'years')
                  .startOf('day')
                  .toDate(),
                endDate: new Date(),
              };
            }

            if (supportedResourceItem.type === 'file') {
              return {
                type: ContainerReferenceType.FILE,
                id: supportedResourceItem.id.toString(),
                resourceId: supportedResourceItem.id,
                page: 1,
              };
            }

            if (supportedResourceItem.type === 'asset') {
              return {
                type: ContainerReferenceType.ASSET,
                id: supportedResourceItem.id.toString(),
                resourceId: supportedResourceItem.id,
              };
            }

            throw new Error('Unsupported resource type');
          });

        onAddContainerReferences(containerReferencesToAdd);
      },
    });
  };

  const onClearLocalStorage = () => {
    clearCanvasState();
    window.location.reload();
  };

  return (
    <>
      <PageTitle title="Industry Canvas" />
      <TitleRowWrapper>
        <PreviewLinkWrapper>
          <Flex alignItems="center">
            <ResourceIcons type="file" style={{ marginRight: '10px' }} />
            <Name level="3">Industry Canvas</Name>
          </Flex>
        </PreviewLinkWrapper>

        <StyledGoBackWrapper>
          <Button onClick={onClearLocalStorage}>
            <Icon type="Delete" /> Clear local storage
          </Button>

          <Button onClick={onAddResourcePress}>
            <Icon type="Plus" /> Add resources...
          </Button>

          <Tooltip content="Download canvas as PDF">
            <Button
              icon="Download"
              aria-label="Download"
              onClick={onDownloadPress}
            />
          </Tooltip>
        </StyledGoBackWrapper>
      </TitleRowWrapper>
      <PreviewTabWrapper>
        <IndustryCanvas
          id={APPLICATION_ID_INDUSTRY_CANVAS}
          currentZoomScale={currentZoomScale}
          viewerRef={unifiedViewerRef}
          applicationId={APPLICATION_ID_INDUSTRY_CANVAS}
          onAddContainerReferences={onAddContainerReferences}
          onDeleteRequest={onDeleteRequest}
          onUpdateRequest={onUpdateRequest}
          interactionState={interactionState}
          setInteractionState={setInteractionState}
          container={container}
          setContainer={setContainer}
          updateContainerReference={updateContainerReference}
          containerReferences={containerReferences}
          canvasAnnotations={canvasAnnotations}
          removeContainerReference={removeContainerReference}
          onRef={setUnifiedViewerRef}
        />
      </PreviewTabWrapper>
    </>
  );
};

const TitleRowWrapper = styled.div`
  h1 {
    margin: 0px;
  }
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 16px;
  border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
`;

const PreviewTabWrapper = styled.div`
  height: 100%;
`;

const Name = styled(Title)`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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
