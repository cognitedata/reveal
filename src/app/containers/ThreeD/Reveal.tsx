import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import styled from 'styled-components';
import { use3DModel } from './hooks';
import {
  AssetNodeCollection,
  Cognite3DModel,
  Cognite3DViewer,
  DefaultCameraManager,
  DefaultNodeAppearance,
  NodeOutlineColor,
} from '@cognite/reveal';
import { Loader } from '@cognite/cogs.js';
import { Alert } from 'antd';
import { useQuery } from 'react-query';
import { getAssetMappingsByAssetId, selectAssetBoundingBox } from './utils';
import { ExpandButton } from './ThreeDToolbar';

type Props = {
  modelId: number;
  revisionId: number;
  focusAssetId?: number | null;
};

export default function Reveal({ focusAssetId, modelId, revisionId }: Props) {
  const sdk = useSDK();
  const revealContainer = useRef<HTMLDivElement | null>(null);
  const [viewer, setViewer] = useState<Cognite3DViewer | null>(null);
  const [viewerModel, setViewerModel] = useState<Cognite3DModel | null>(null);
  const { data: threeDModel, isLoading: isThreeDModelLoading } = use3DModel(
    Number(modelId)
  );
  const { data: mappings } = useQuery(
    ['getAssetMappingsByAssetId', modelId, revisionId, focusAssetId],
    () => getAssetMappingsByAssetId(sdk, modelId, revisionId, [focusAssetId!]),
    { enabled: !!focusAssetId }
  );

  const { data: boundingBox } = useQuery(
    ['selectAssetBoundingBox', modelId, revisionId, focusAssetId],
    () => selectAssetBoundingBox(mappings!, viewerModel!),
    { enabled: !!mappings && mappings.length > 0 && !!viewerModel }
  );

  const createViewerWithCameraAndModel = useCallback(() => {
    if (!threeDModel || !revisionId || !revealContainer.current) {
      return null;
    }

    const threeDViewer = new Cognite3DViewer({
      sdk,
      domElement: revealContainer.current,
      continuousModelStreaming: true,
    });

    const cameraManager = threeDViewer.cameraManager as DefaultCameraManager;
    cameraManager.setCameraControlsOptions({
      mouseWheelAction: 'zoomToCursor',
      changeCameraTargetOnClick: true,
    });

    threeDViewer
      .addModel({
        modelId: modelId,
        revisionId,
      } as Cognite3DModel)
      .then(model => {
        threeDViewer.loadCameraFromModel(model);
        setViewerModel(model as Cognite3DModel);
      });
    return threeDViewer;
  }, [sdk, modelId, threeDModel, revisionId]);

  useEffect(() => {
    if (!viewer) {
      const threeDViewer = createViewerWithCameraAndModel();
      setViewer(threeDViewer);
    } else if (viewer && viewer.models.length === 1) {
      viewer.dispose();
      const threeDViewer = createViewerWithCameraAndModel();
      setViewer(threeDViewer);
    }
  }, [viewer, createViewerWithCameraAndModel]);

  useEffect(() => {
    if (!viewerModel) {
      return;
    }
    if (focusAssetId) {
      const assetNodes = new AssetNodeCollection(sdk, viewerModel);
      assetNodes.executeFilter({ assetId: focusAssetId });

      viewerModel.removeAllStyledNodeCollections();
      viewerModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      viewerModel.assignStyledNodeCollection(assetNodes, {
        renderGhosted: false,
        outlineColor: NodeOutlineColor.Cyan,
      });

      if (boundingBox) {
        viewer?.fitCameraToBoundingBox(boundingBox);
      }
    } else {
      viewerModel.removeAllStyledNodeCollections();
      viewerModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    }
  }, [boundingBox, focusAssetId, sdk, viewer, viewerModel]);

  if (isThreeDModelLoading) {
    return <Loader />;
  }

  if (!threeDModel || !revisionId) {
    return (
      <Alert
        type="error"
        message="Error"
        description="An error occurred retrieving the resource. Make sure you have access to this resource type."
        style={{ marginTop: '50px' }}
      />
    );
  }

  return (
    <RevealContainer ref={revealContainer}>
      <ButtonOverlayContainer>
        <ExpandButton viewer={viewer} viewerModel={viewerModel} />
      </ButtonOverlayContainer>
    </RevealContainer>
  );
}

const ButtonOverlayContainer = styled.div`
  position: relative;
  top: 10px;
  left: 50%;
`;

// This container has an inline style 'position: relative' given by @cognite/reveal.
// We can not cancel it, so we had to use that -85px trick here!
const RevealContainer = styled.div`
  height: calc(100% - 85px);
  width: 100%;
  padding: 16px;
  padding-top: 0px;
`;
