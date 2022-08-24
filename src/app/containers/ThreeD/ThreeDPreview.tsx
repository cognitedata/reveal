import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import {
  Cognite3DViewer,
  Cognite3DModel,
  DefaultCameraManager,
} from '@cognite/reveal';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { useParams } from 'react-router-dom';
import {
  useDefault3DModelRevision,
  use3DModel,
} from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';
import { Button, Tooltip, Loader } from '@cognite/cogs.js';
import { AssetMappingsSidebar } from 'app/containers/ThreeD/AssetMappingsSidebar';
import { ExpandButton } from 'app/containers/ThreeD/ThreeDToolbar';
import { AssetPreviewSidebar } from 'app/containers/ThreeD/AssetPreviewSidebar';
import { Alert } from 'antd';

export const ThreeDPreview = ({
  threeDId,
  actions,
}: {
  threeDId: number;
  actions?: React.ReactNode;
}) => {
  const { id: modelId } = useParams<{
    id: string;
  }>();

  const sdk = useSDK();
  const revealContainer = useRef<HTMLDivElement | null>(null);

  const { data: threeDModel, isLoading: isThreeDModelLoading } = use3DModel(
    Number(modelId)
  );

  const { data: revision, isLoading: isRevisionLoading } =
    useDefault3DModelRevision(Number(modelId));

  const [viewer, setViewer] = useState<Cognite3DViewer | null>(null);
  const [viewerModel, setViewerModel] = useState<Cognite3DModel | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [isAssetMappingSidebarVisible, setIsAssetMappingSidebarVisible] =
    useState<boolean>(true);

  const createViewerWithCameraAndModel = useCallback(() => {
    if (!threeDModel || !revision || !revealContainer.current) {
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
        modelId: Number(modelId),
        revisionId: revision!.id,
      } as Cognite3DModel)
      .then(model => {
        threeDViewer.loadCameraFromModel(model);
        setViewerModel(model as Cognite3DModel);
      });
    return threeDViewer;
  }, [sdk, modelId, threeDModel, revision]);

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
      <ResourceTitleRow
        title={threeDModel?.name}
        item={{ id: threeDId, type: 'threeD' }}
        afterDefaultActions={actions}
      />
      <RevealContainer ref={revealContainer} />
      {!isAssetMappingSidebarVisible && (
        <ToolBarWrapper>
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
          isBackButtonAvailable={false}
        />
      )}
    </>
  );
};

// This container has an inline style 'position: relative' given by @cognite/reveal.
// We can not cancel it, so we had to use that -85px trick here!
const RevealContainer = styled.div`
  height: calc(100% - 85px);
  width: 100%;
`;

const ToolBarWrapper = styled.div`
  position: absolute;
  top: 96px;
  left: 96px;

  button {
    margin-left: 5px;
  }
`;
