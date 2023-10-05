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
  useContextualizeThreeDViewerStoreCad,
  setContextualizedNodes,
  setModelId,
} from '../../useContextualizeThreeDViewerStoreCad';
import { getCdfCadContextualization } from '../../utils/getCdfCadContextualization';
import { getCogniteCadModel } from '../../utils/getCogniteCadModel';
import { saveCdfThreeDCadContextualization } from '../../utils/saveCdfThreeDCadContextualization';

import { CadRevealContent } from './CadRevealContent';
import { useCadOnClickHandler } from './hooks/useCadOnClickHandler';
import { useSyncCadStateWithViewer } from './hooks/useSyncCadStateWithViewer';

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const CadContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();

  const { isResourceSelectorOpen, threeDViewer, selectedNodeIdsList } =
    useContextualizeThreeDViewerStoreCad((state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      threeDViewer: state.threeDViewer,
      selectedNodeIdsList: state.selectedNodeIds,
    }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  useEffect(() => {
    setModelId(modelId);
  }, [modelId]);

  useSyncCadStateWithViewer();

  // use effects hooks
  useEffect(() => {
    const updateSelectedCadNodes = async () => {
      // TODO: Display a user friendly error message if the model is not found
      if (threeDViewer === null) return;

      const model = getCogniteCadModel({
        modelId,
        viewer: threeDViewer,
      });
      if (model === undefined) return;

      const currentContextualizedNodes = await getCdfCadContextualization({
        sdk: sdk,
        modelId: modelId,
        revisionId: revisionId,
        nodeId: undefined,
      });
      setContextualizedNodes(currentContextualizedNodes);
    };

    updateSelectedCadNodes();
  }, [modelId, revisionId, sdk, threeDViewer]);

  useCadOnClickHandler();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const handleResourceSelectorSelect = async (assetId: number) => {
    await saveCdfThreeDCadContextualization({
      sdk,
      modelId,
      revisionId,
      nodeIds: selectedNodeIdsList,
      assetId,
    });
  };

  return (
    <>
      <StyledSplitter
        secondaryInitialSize={rightSidePanelWidth}
        onSecondaryPaneSizeChange={setRightSidePanelWidth}
      >
        <ThreeDViewerStyled>
          <RevealContainer sdk={sdk} color={defaultRevealColor}>
            <CadRevealContent modelId={modelId} revisionId={revisionId} />
          </RevealContainer>
        </ThreeDViewerStyled>
        {isResourceSelectorOpen && (
          <ResourceSelector
            selectionMode="single"
            visibleResourceTabs={['asset']}
            onSelect={(item) => {
              handleResourceSelectorSelect(item.id);
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
