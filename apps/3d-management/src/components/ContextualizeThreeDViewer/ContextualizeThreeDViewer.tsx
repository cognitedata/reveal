import { useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { RevealContainer } from '@cognite/reveal-react-components';
import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  DEFAULT_RIGHT_SIDE_PANEL_WIDTH,
  defaultRevealColor,
} from '../../pages/ContextualizeEditor/constants';
import { useLocalStorage } from '../../utils/useLocalStorage';

import { RevealContent } from './components/RevealContent';
import { useSyncStateWithViewer } from './hooks/useSyncStateWithViewer';
import { useZoomToAnnotation } from './hooks/useZoomToAnnotation';
import {
  setModelId,
  setPendingAnnotation,
  useContextualizeThreeDViewerStore,
  setAnnotations,
} from './useContextualizeThreeDViewerStore';
import { getCdfAnnotations } from './utils/annotations/annotationUtils';
import { createCdfThreeDAnnotation } from './utils/createCdfThreeDAnnotation';
import { getCognitePointCloudModel } from './utils/getCognitePointCloudModel';

const fetchAnnotations = async ({
  queryKey,
}: QueryFunctionContext<[string, CogniteClient, number]>) => {
  const [_key, sdk, modelId] = queryKey;
  return await getCdfAnnotations(sdk, modelId);
};

const deleteCdfAnnotation = async (
  sdk: CogniteClient,
  annotationId: number
) => {
  return await sdk.annotations.delete([{ id: annotationId }]);
};

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const ContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const { isResourceSelectorOpen, pendingAnnotation, threeDViewer } =
    useContextualizeThreeDViewerStore((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      pendingAnnotation: state.pendingAnnotation,
      threeDViewer: state.threeDViewer,
    }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  const { data: annotations } = useQuery(
    ['annotations', sdk, modelId],
    fetchAnnotations
  );

  const mutation = useMutation(
    (annotationId: number) => deleteCdfAnnotation(sdk, annotationId),
    {
      onSuccess: () => {
        // Invalidate to refetch
        queryClient.invalidateQueries(['annotations', sdk, modelId]);
      },
    }
  );

  const onDeleteAnnotation = (annotationId: number) => {
    mutation.mutate(annotationId);
  };

  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    if (annotations === undefined) return;

    setAnnotations(annotations);
  }, [annotations]);

  useSyncStateWithViewer();
  const zoomToAnnotation = useZoomToAnnotation();

  const saveAnnotationToCdf = (assetId: number) => {
    if (threeDViewer === null || pendingAnnotation === null) return;

    const pointCloudModel = getCognitePointCloudModel({
      modelId,
      viewer: threeDViewer,
    });
    if (pointCloudModel === undefined) return;

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPendingAnnotation(null);
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <>
      <StyledSplitter
        secondaryInitialSize={rightSidePanelWidth}
        onSecondaryPaneSizeChange={setRightSidePanelWidth}
      >
        <ThreeDViewerStyled>
          <RevealContainer sdk={sdk} color={defaultRevealColor}>
            <RevealContent
              modelId={modelId}
              revisionId={revisionId}
              onDeleteAnnotation={onDeleteAnnotation}
              onZoomToAnnotation={zoomToAnnotation}
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
