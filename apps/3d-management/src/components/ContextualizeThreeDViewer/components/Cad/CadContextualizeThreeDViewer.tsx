import { useEffect, useRef } from 'react';

import styled from 'styled-components';

import { Splitter } from '@data-exploration/components';
import { ResourceSelector } from '@data-exploration/containers';
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { Cognite3DViewer } from '@cognite/reveal';
import { RevealContainer } from '@cognite/reveal-react-components';
import {
  AssetMapping3D,
  AssetMapping3DBase,
  CogniteClient,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { useMetrics } from '../../../../hooks/useMetrics';
import {
  CAD_EDITOR_METRIC_PREFIX,
  CONTEXTUALIZE_EDITOR_HEADER_HEIGHT,
  DEFAULT_RIGHT_SIDE_PANEL_WIDTH,
  defaultRevealColor,
} from '../../../../pages/ContextualizeEditor/constants';
import { useLocalStorage } from '../../../../utils/useLocalStorage';
import { assignStylesToCadModel } from '../../utils/assignStylesToCadModel';
import { getCdfCadContextualization } from '../../utils/getCdfCadContextualization';
import { getCogniteCadModel } from '../../utils/getCogniteCadModel';
import { saveCdfThreeDCadContextualization } from '../../utils/saveCdfThreeDCadContextualization';

import { CadRevealContent } from './CadRevealContent';
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

  const contextualizedNodes = await getCdfCadContextualization({
    sdk,
    modelId,
    revisionId,
    nodeId: undefined,
    assetId: undefined,
  });

  // Array treeshaking: remove potential duplicated mappings between same assetId to the same nodeId
  // It's just a safeguard in case the duplicated mappings still have for old mappings
  // TODO: we can remove it once we create a robust asset mappings creation without duplications and when there is no duplicated in any model.
  const contextualizedNodesFiltered: AssetMapping3D[] | null =
    contextualizedNodes?.filter(
      (annotation, index, self) =>
        self.findIndex(
          (item) =>
            item.assetId === annotation.assetId &&
            item.nodeId === annotation.nodeId
        ) === index
    ) || null;

  return contextualizedNodesFiltered;
};

const deleteCadCdfAnnotation = async ({
  sdk,
  modelId,
  revisionId,
  assetId,
}: {
  sdk: CogniteClient;
  modelId: number;
  revisionId: number;
  assetId: number | undefined;
}) => {
  const mappedNodes = await getCdfCadContextualization({
    sdk,
    modelId,
    revisionId,
    nodeId: undefined,
    assetId,
  });

  const mappings = mappedNodes.map(
    (node): AssetMapping3DBase => ({
      nodeId: node.nodeId,
      assetId: node.assetId,
    })
  );
  await sdk.assetMappings3D.delete(modelId, revisionId, mappings);
};

type ContextualizeThreeDViewerProps = {
  modelId: number;
  revisionId: number;
};

export const CadContextualizeThreeDViewer = ({
  modelId,
  revisionId,
}: ContextualizeThreeDViewerProps) => {
  const metrics = useMetrics(CAD_EDITOR_METRIC_PREFIX);
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const viewerRef = useRef<Cognite3DViewer | null>(null);

  const {
    isResourceSelectorOpen,
    selectedNodeIds,
    isModelLoaded,
    model,
    selectedNodeIdsStyleIndex,
    contextualizedNodesStyleIndex,
    highlightedNodeIdsStyleIndex,
  } = useCadContextualizeStore((state) => ({
    isResourceSelectorOpen: state.isResourceSelectorOpen,
    model: state.model,
    selectedNodeIds: state.selectedNodeIds,
    isModelLoaded: state.isModelLoaded,
    modelId: state.modelId,
    revisionId: state.revisionId,
    selectedNodeIdsStyleIndex: state.selectedNodeIdsStyleIndex,
    contextualizedNodesStyleIndex: state.contextualizedNodesStyleIndex,
    highlightedNodeIdsStyleIndex: state.highlightedNodeIdsStyleIndex,
  }));

  const [rightSidePanelWidth, setRightSidePanelWidth] = useLocalStorage(
    'COGNITE_CONTEXTUALIZE_EDITOR_RESOURCE_SELECTOR_WIDTH',
    DEFAULT_RIGHT_SIDE_PANEL_WIDTH
  );

  const { data: contextualizedNodes } = useQuery(
    ['cadContextualization', sdk, modelId, revisionId],
    fetchContextualizedNodes
  );

  useEffect(() => {
    metrics.track('Opened');
  }, [metrics]);

  useEffect(() => {
    setModelId(modelId);
    setRevisionId(revisionId);
  }, [modelId, revisionId]);

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
        metrics.track('Annotation.Created', {
          numNodes: selectedNodeIds.length,
        });
        queryClient.invalidateQueries([
          'cadContextualization',
          sdk,
          modelId,
          revisionId,
        ]);
      },
    }
  );

  const mutationDeletion = useMutation(
    (params: {
      sdk: CogniteClient;
      modelId: number;
      revisionId: number;
      assetId: number;
    }) =>
      deleteCadCdfAnnotation({
        sdk: params.sdk,
        modelId: params.modelId,
        revisionId: params.revisionId,
        assetId: params.assetId,
      }),
    {
      onSuccess: () => {
        metrics.track('Annotation.Deleted');
        queryClient.invalidateQueries([
          'cadContextualization',
          sdk,
          modelId,
          revisionId,
        ]);
      },
    }
  );

  const onDeleteAnnotation = (annotationByAssetId: number) => {
    mutationDeletion.mutate({
      sdk,
      modelId,
      revisionId,
      assetId: annotationByAssetId,
    });
  };

  useEffect(() => {
    if (contextualizedNodes === undefined) return;

    setContextualizedNodes(contextualizedNodes);
  }, [contextualizedNodes]);

  useEffect(() => {
    const viewer = viewerRef.current;

    if (!viewer) return;
    if (!isModelLoaded) return;
    if (!model) return;

    // Gets the actual model from the viewer, even the model state is updated
    // Potential bug in Reveal because the model from the state is not linked to the CadMaterialManager yet.
    // So we use the state as a safeguard and then get the actual model from the viewer
    // TODO: investigate a better way to not use model state for this
    const cadModel = getCogniteCadModel({
      modelId,
      revisionId,
      viewer,
    });
    if (cadModel === undefined) return;

    // assign styles for the model
    assignStylesToCadModel({
      model: cadModel,
      selectedNodeIdsStyleIndex,
      contextualizedNodesStyleIndex,
      highlightedNodeIdsStyleIndex,
    });

    // reset selected nodes from cache when loading this main component initially
    setSelectedNodeIds([]);
  }, [
    isModelLoaded,
    viewerRef,
    modelId,
    model,
    revisionId,
    selectedNodeIdsStyleIndex,
    contextualizedNodesStyleIndex,
    highlightedNodeIdsStyleIndex,
  ]);

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

    if (selectedNodeIds.length === 0) return;

    // Avoid duplicating asset mappings (same assetId with same nodeId)
    let nodeIdsFiltered: number[] = selectedNodeIds;
    if (contextualizedNodes) {
      nodeIdsFiltered = selectedNodeIds.filter(
        (nodeId) =>
          !contextualizedNodes.find(
            (item) => item.assetId === assetId && item.nodeId === nodeId
          )
      );
    }

    mutation.mutate({
      sdk,
      modelId,
      revisionId,
      nodeIds: nodeIdsFiltered,
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
          <RevealContainer
            sdk={sdk}
            color={defaultRevealColor}
            viewerOptions={{
              loadingIndicatorStyle: { placement: 'topRight', opacity: 1 },
            }}
          >
            <CadRevealContent
              modelId={modelId}
              revisionId={revisionId}
              onDeleteAnnotation={onDeleteAnnotation}
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
            shouldDisableAddButton={selectedNodeIds.length === 0}
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
