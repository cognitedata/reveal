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
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import {
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  DEFAULT_RIGHT_SIDE_PANEL_WIDTH,
  defaultRevealColor,
} from '../../../../pages/ContextualizeEditor/constants';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import { getCdfCadContextualization } from '../../utils/getCdfCadContextualization';
import { saveCdfThreeDCadContextualization } from '../../utils/saveCdfThreeDCadContextualization';

import { CadRevealContent } from './CadRevealContent';
import { useCadOnClickHandler } from './hooks/useCadOnClickHandler';
import { useSyncCadStateWithViewer } from './hooks/useSyncCadStateWithViewer';
import {
  useCadContextualizeStore,
  setContextualizedNodes,
  setModelId,
  setSelectedNodeIds,
  setRevisionId,
} from './useCadContextualizeStore';

const fetchContextualizedNodes = async ({
  queryKey,
}: QueryFunctionContext<[string, CogniteClient, number, number]>) => {
  const [_key, sdk, modelId, revisionId] = queryKey;

  return await getCdfCadContextualization({
    sdk,
    modelId,
    revisionId,
    nodeId: undefined,
  });
};

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const CadContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const { isResourceSelectorOpen, selectedNodeIds } = useCadContextualizeStore(
    (state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      threeDViewer: state.threeDViewer,
      selectedNodeIds: state.selectedNodeIds,
    })
  );

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  const { data: contextualizedNodes } = useQuery(
    ['cadContextualization', sdk, modelId, revisionId],
    fetchContextualizedNodes
  );

  const mutation = useMutation(
    (params: {
      sdk: CogniteClient;
      modelId: number;
      revisionId: number;
      nodeIds: Array<number>;
      assetId: number;
    }) => saveCdfThreeDCadContextualization(params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          'cadContextualization',
          sdk,
          modelId,
          revisionId,
        ]);
      },
    }
  );

  useEffect(() => {
    if (contextualizedNodes === undefined) return;

    setContextualizedNodes(contextualizedNodes);
  }, [contextualizedNodes]);

  useEffect(() => {
    setModelId(modelId);
    setRevisionId(revisionId);
  }, [modelId, revisionId]);

  useSyncCadStateWithViewer();
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
    setSelectedNodeIds([]);
    mutation.mutate({
      sdk,
      modelId,
      revisionId,
      nodeIds: selectedNodeIds,
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
