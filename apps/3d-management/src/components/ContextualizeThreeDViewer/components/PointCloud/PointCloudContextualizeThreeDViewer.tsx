import { useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import {
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { RevealContainer } from '@cognite/reveal-react-components';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  DEFAULT_RIGHT_SIDE_PANEL_WIDTH,
  defaultRevealColor,
} from '../../../../pages/ContextualizeEditor/constants';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import { useAnnotationMutation } from '../../hooks/useAnnotationsMutation';
import {
  setModelId,
  setPendingAnnotation,
  useContextualizeThreeDViewerStore,
  setAnnotations,
  setSelectedAnnotationId,
} from '../../useContextualizeThreeDViewerStore';
import { getCdfAnnotations } from '../../utils/annotations/annotationUtils';
import { createCdfThreeDAnnotation } from '../../utils/createCdfThreeDAnnotation';
import { getCognitePointCloudModel } from '../../utils/getCognitePointCloudModel';

import { useSyncStateWithViewerPointCloud } from './hooks/useSyncStateWithViewerPointCloud';
import { useUpdateCdfThreeDAnnotation } from './hooks/useUpdateCdfThreeDAnnotation';
import { useZoomToAnnotation } from './hooks/useZoomToAnnotation';
import { PointCloudRevealContent } from './PointCloudRevealContent';

const fetchAnnotations = async ({
  queryKey,
}: QueryFunctionContext<[string, CogniteClient, number]>) => {
  const [_key, sdk, modelId] = queryKey;
  return await getCdfAnnotations(sdk, modelId);
};

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const PointCloudContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const {
    isResourceSelectorOpen,
    pendingAnnotation,
    viewer,
    selectedAnnotationId,
  } = useContextualizeThreeDViewerStore((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    pendingAnnotation: state.pendingAnnotation,
    viewer: state.threeDViewer,
    selectedAnnotationId: state.selectedAnnotationId,
  }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  const { data: annotations } = useQuery(
    ['annotations', sdk, modelId],
    fetchAnnotations
  );

  const mutation = useAnnotationMutation();

  const onZoomToAnnotation = useZoomToAnnotation();
  const updateCdfThreeDAnnotation = useUpdateCdfThreeDAnnotation();

  const onDeleteAnnotation = (annotationId: number) => {
    mutation.mutate(annotationId);
  };

  // use effects hooks
  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    if (annotations === undefined) return;

    setAnnotations(annotations);
  }, [annotations]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPendingAnnotation(null);
        setSelectedAnnotationId(null);
        event.stopPropagation();
      }
      if (event.key === 'Enter') {
        updateCdfThreeDAnnotation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const saveAnnotationToCdf = (assetId: number) => {
    if (viewer === null || pendingAnnotation === null) return;

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer: viewer,
    });
    if (pointCloudModel === undefined) return;

    if (selectedAnnotationId !== null) {
      mutation.mutate(selectedAnnotationId);
    }
    createCdfThreeDAnnotation({
      sdk,
      modelId,
      assetRefId: assetId,
      pointCloudModel,
      cubeAnnotation: pendingAnnotation,
    }).then(() => {
      // Invalidate to refetch
      queryClient.invalidateQueries(['annotations', sdk, modelId]);
    });
  };

  useSyncStateWithViewerPointCloud();

  return (
    <>
      <StyledSplitter
        secondaryInitialSize={rightSidePanelWidth}
        onSecondaryPaneSizeChange={setRightSidePanelWidth}
      >
        <ThreeDViewerStyled>
          <RevealContainer
            sdk={sdk}
            color={defaultRevealColor}
            viewerOptions={{
              loadingIndicatorStyle: { placement: 'topRight', opacity: 1 },
            }}
          >
            <PointCloudRevealContent
              modelId={modelId}
              revisionId={revisionId}
              onDeleteAnnotation={onDeleteAnnotation}
              onZoomToAnnotation={onZoomToAnnotation}
              onUpdateCdfThreeDAnnotation={updateCdfThreeDAnnotation}
            />
          </RevealContainer>
        </ThreeDViewerStyled>
        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            shouldDisableAddButton={pendingAnnotation === null}
            onSelect={(item) => {
              saveAnnotationToCdf(item.id);
              setPendingAnnotation(null);
            }}
          />
        )}
      </StyledSplitter>
    </>
  );
};

const ThreeDViewerStyled = styled.div`
  position: relative;
  display: flex;
  height: calc(
    100vh - var(--cdf-ui-navigation-height) -
      ${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px
  ); /* sidebar height and top-bot paddings subtracted */
`;

const StyledSplitter = styled(Splitter)`
  height: calc(
    100vh - var(--cdf-ui-navigation-height) -
      ${CONTEXTUALIZE_EDITOR_HEADER_HEIGHT}px
  );
`;
