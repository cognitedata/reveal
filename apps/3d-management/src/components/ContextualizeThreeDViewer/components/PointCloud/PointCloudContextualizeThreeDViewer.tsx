import { useEffect } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';

import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  DEFAULT_RIGHT_SIDE_PANEL_WIDTH,
  defaultRevealColor,
} from '../../../../pages/ContextualizeEditor/constants';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import {
  setModelId,
  setPendingAnnotation,
  useContextualizeThreeDViewerStore,
  setAnnotations,
  onCloseResourceSelector,
} from '../../useContextualizeThreeDViewerStore';
import { getCdfAnnotations } from '../../utils/annotations/annotationUtils';
import { saveCdfThreeDPointCloudContextualization } from '../../utils/saveCdfThreeDPointCloudContextualization';

import { PointCloudRevealContent } from './PointCloudRevealContent';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const PointCloudContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  const {
    isResourceSelectorOpen,
    pendingAnnotation,
    viewer,
    model,
    modelType,
  } = useContextualizeThreeDViewerStore((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    pendingAnnotation: state.pendingAnnotation,
    viewer: state.threeDViewer,
    model: state.model,
    modelType: state.modelType,
    selectedNodeIdsList: state.selectedNodeIdsList,
    selectedAndContextualizedNodesList:
      state.selectedAndContextualizedNodesList,
  }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  // use effects hooks
  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useEffect(() => {
    const loadAnnotations = async () => {
      const annotations = await getCdfAnnotations(sdk, modelId);
      setAnnotations(annotations);
    };
    loadAnnotations();
  }, [sdk, modelId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseResourceSelector();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const generateContextualization = (assetId: number) => {
    if (modelType === 'pointcloud') {
      saveCdfThreeDPointCloudContextualization({
        sdk,
        viewer,
        model,
        modelId,
        assetId,
        pendingAnnotation,
      });
    }
  };
  return (
    <>
      <StyledSplitter
        secondaryInitialSize={rightSidePanelWidth}
        onSecondaryPaneSizeChange={setRightSidePanelWidth}
      >
        <ThreeDViewerStyled>
          <RevealContainer sdk={sdk} color={defaultRevealColor}>
            <PointCloudRevealContent
              modelId={modelId}
              revisionId={revisionId}
            />
          </RevealContainer>
        </ThreeDViewerStyled>
        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            shouldDisableAddButton={pendingAnnotation === null}
            onSelect={(item) => {
              onCloseResourceSelector();
              generateContextualization(item.id);
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
