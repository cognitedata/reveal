import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { noop } from 'lodash';

import { Button, ToolBar } from '@cognite/cogs.js';
import { DefaultCameraManager, CogniteModel } from '@cognite/reveal';
import {
  CadModelContainer,
  useReveal,
  withSuppressRevealEvents,
} from '@cognite/reveal-react-components';
import { AssetMapping3D, ListResponse } from '@cognite/sdk/dist/src';

import { FLOATING_ELEMENT_MARGIN } from '../../../../pages/ContextualizeEditor/constants';
import {
  onCloseResourceSelector,
  onOpenResourceSelector,
  setModel,
  setThreeDViewer,
  setToolbarForCadModelsState,
  useContextualizeThreeDViewerStore,
} from '../../useContextualizeThreeDViewerStore';

import { CadToolBar } from './CadToolBar/CadToolBar';

interface RevealContentProps {
  modelId: number;
  revisionId: number;
  onContextualizationUpdated: typeof noop;
}

export const CadRevealContent = ({
  modelId,
  revisionId,
  onContextualizationUpdated,
}: RevealContentProps) => {
  const viewer = useReveal();
  const { isResourceSelectorOpen } = useContextualizeThreeDViewerStore(
    (state) => ({
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      modelType: state.modelType,
      contextualizedNodes: state.contextualizedNodes,
    })
  );

  const [error, setError] = useState<Error>();

  const handleModelOnLoad = (model: CogniteModel) => {
    if (!(viewer?.cameraManager instanceof DefaultCameraManager)) {
      console.warn(
        'Camera manager is not DefaultCameraManager, so click to change camera target will not work.'
      );
      return;
    }
    viewer.loadCameraFromModel(model);
    viewer.fitCameraToModel(model);
    viewer.cameraManager.setCameraControlsOptions({
      changeCameraTargetOnClick: true,
      mouseWheelAction: 'zoomToCursor',
    });

    setToolbarForCadModelsState();

    if (viewer.domElement) {
      setModel(model);
    }
  };

  const onContextualizationDeleted = (
    mappedNodesDeleted: ListResponse<AssetMapping3D[]>
  ) => {
    const state = useContextualizeThreeDViewerStore.getState();
    const oldContextualizedNodes = state.contextualizedNodes;

    const newContextualizedNodes: ListResponse<AssetMapping3D[]> = {
      items: [],
    };
    oldContextualizedNodes?.items.forEach((item) => {
      if (
        mappedNodesDeleted.items.find((node) => item.nodeId !== node.nodeId)
      ) {
        newContextualizedNodes.items.push(item);
      }
    });
    onContextualizationUpdated(newContextualizedNodes, mappedNodesDeleted);
  };

  useEffect(() => {
    if (viewer) {
      setThreeDViewer(viewer);
    }
  }, [viewer]);

  const handleLoadError = (e: Error) => {
    if (e instanceof Error && viewer.domElement) {
      throw error;
    }
  };

  return (
    <>
      <CadToolBar
        modelId={modelId}
        revisionId={revisionId}
        onContextualizationDeleted={(mappedNodesDeleted) => {
          onContextualizationDeleted(mappedNodesDeleted);
        }}
      />
      <CadModelContainer
        addModelOptions={{
          modelId: modelId,
          revisionId: revisionId,
        }}
        onLoadError={(options, e) => handleLoadError(e)}
        onLoad={handleModelOnLoad}
      />

      <StyledResourceSelectorButtonWrapper>
        <Button
          type="ghost"
          size="small"
          icon={isResourceSelectorOpen ? 'ChevronRight' : 'ChevronLeft'}
          aria-label="Toggle resource selector visibility"
          onClick={() => {
            if (isResourceSelectorOpen) {
              onCloseResourceSelector();
              return;
            }
            onOpenResourceSelector();
          }}
        />
      </StyledResourceSelectorButtonWrapper>
    </>
  );
};

const StyledResourceSelectorButtonWrapper = styled(
  withSuppressRevealEvents(ToolBar)
)`
  position: absolute;
  top: ${FLOATING_ELEMENT_MARGIN}px;
  right: ${FLOATING_ELEMENT_MARGIN}px;
`;

const CanvasContainer = styled.div`
  flex-grow: 1;
  canvas {
    height: 100%;
    width: 100%;
  }
`;
