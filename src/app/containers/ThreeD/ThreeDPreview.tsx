import React, { useState, useEffect, useCallback } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import {
  Cognite3DViewer,
  Cognite3DModel,
  DefaultCameraManager,
} from '@cognite/reveal';
import { useParams } from 'react-router-dom';
import {
  useDefault3DModelRevision,
  use3DModel,
} from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';
import { Button, Tooltip, Loader } from '@cognite/cogs.js';
import { AssetMappingsSidebar } from 'app/containers/ThreeD/AssetMappingsSidebar';
import { HomeButton, ExpandButton } from 'app/containers/ThreeD/ThreeDToolbar';
import { AssetPreviewSidebar } from 'app/containers/ThreeD/AssetPreviewSidebar';
import { Alert } from 'antd';

export const ThreeDPreview = () => {
  const { id: modelId } = useParams<{
    id: string;
  }>();

  const sdk = useSDK();
  const revealContainer = React.useRef<HTMLDivElement | null>(null);

  const { data: threeDModel, isLoading: isThreeDModelLoading } = use3DModel(
    Number(modelId)
  );
  const { data: revision, isLoading: isRevisionLoading } =
    useDefault3DModelRevision(Number(modelId));

  const [viewer, setViewer] = useState<Cognite3DViewer | null>(null);
  const [viewerModel, setViewerModel] = useState<Cognite3DModel | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [isAssetMappingSidebarVisible, setIsAssetMappingSidebarVisible] =
    useState<boolean>(false);

  const initializeModel = useCallback(async () => {
    if (!threeDModel || !revision || !revealContainer.current) {
      return;
    }

    if (!viewer) {
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

      const model = (await threeDViewer.addModel({
        modelId: Number(modelId),
        revisionId: revision?.id,
      })) as Cognite3DModel;
      threeDViewer.loadCameraFromModel(model);

      setViewer(threeDViewer);
      setViewerModel(model);
    }
  }, [sdk, modelId, threeDModel, revision, viewer]);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  if (isThreeDModelLoading || isRevisionLoading) {
    return <Loader />;
  }

  if (!threeDModel || !revision) {
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
    <>
      <PageTitle title={threeDModel?.name} />
      <RevealContainer ref={revealContainer} />
      {!isAssetMappingSidebarVisible && (
        <ToolBarWrapper>
          <HomeButton />
          <ExpandButton viewer={viewer} viewerModel={viewerModel} />
          <Tooltip content="Search">
            <Button
              icon="Search"
              onClick={() => setIsAssetMappingSidebarVisible(true)}
              aria-label="Search"
            />
          </Tooltip>
        </ToolBarWrapper>
      )}
      {isAssetMappingSidebarVisible && (
        <AssetMappingsSidebar
          modelId={threeDModel?.id}
          revisionId={revision?.id}
          viewer={viewer}
          viewerModel={viewerModel}
          selectedAssetId={selectedAssetId}
          setSelectedAssetId={setSelectedAssetId}
          onClose={() => setIsAssetMappingSidebarVisible(false)}
        />
      )}
      {!!selectedAssetId && (
        <AssetPreviewSidebar
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
        />
      )}
    </>
  );
};

const RevealContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const ToolBarWrapper = styled.div`
  position: absolute;
  top: 70px;
  left: 16px;
  z-index: 100;

  button {
    margin-left: 5px;
  }
`;
