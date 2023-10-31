import { useEffect, useRef } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import {
  QueryFunctionContext,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { Cognite3DViewer } from '@cognite/reveal';
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
  ToolType,
  setTool,
} from '../../useContextualizeThreeDViewerStore';
import { getCdfAnnotations } from '../../utils/annotations/annotationUtils';
import { createCdfThreeDAnnotation } from '../../utils/createCdfThreeDAnnotation';
import { getCognitePointCloudModel } from '../../utils/getCognitePointCloudModel';

import { useUpdateCdfThreeDAnnotation } from './hooks/useUpdateCdfThreeDAnnotation';
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
  const viewerRef = useRef<Cognite3DViewer | null>(null);

  const { isResourceSelectorOpen, pendingAnnotation, selectedAnnotationId } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      pendingAnnotation: state.pendingAnnotation,
      selectedAnnotationId: state.selectedAnnotationId,
    }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  const { data: annotations } = useQuery(
    ['annotations', sdk, modelId],
    fetchAnnotations
  );
  useEffect(() => {
    if (annotations === undefined) return;

    setAnnotations(annotations);
  }, [annotations]);

  const mutation = useAnnotationMutation();
  const onDeleteAnnotation = (annotationId: number) => {
    if (selectedAnnotationId === annotationId) {
      setSelectedAnnotationId(null);
    }
    mutation.mutate(annotationId);
  };

  const updateCdfThreeDAnnotation = useUpdateCdfThreeDAnnotation({
    viewer: viewerRef.current,
  });

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
      if (event.key === 'Backspace') {
        if (selectedAnnotationId === null) return;

        onDeleteAnnotation(selectedAnnotationId);
        setPendingAnnotation(null);
      }
      if (event.key === 'v') {
        setTool(ToolType.SELECT_TOOL);
      }
      if (event.key === 'b') {
        setTool(ToolType.ADD_ANNOTATION);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const saveAnnotationToCdf = (assetId: number) => {
    const viewer = viewerRef.current;
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
      assetId,
      pointCloudModel,
      cubeAnnotation: pendingAnnotation,
    }).then(() => {
      // Invalidate to refetch
      queryClient.invalidateQueries(['annotations', sdk, modelId]);
    });
  };

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
              onUpdateCdfThreeDAnnotation={updateCdfThreeDAnnotation}
              onSetViewerRef={(viewer) => {
                viewerRef.current = viewer;
              }}
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
