import React, { useEffect } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { useParams } from 'react-router-dom';
import {
  use3DModel,
  useDefault3DModelRevision,
} from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';
import { AssetPreviewSidebar } from 'app/containers/ThreeD/AssetPreviewSidebar';
import { useSearchParamNumber } from 'app/utils/URLUtils';
import Reveal from './Reveal';
import { AssetMappingsSidebar } from './AssetMappingsSidebar';
import { trackUsage } from 'app/utils/Metrics';
import { ExpandButton, FocusAssetButton } from './ThreeDToolbar';
import { Flex, ToolBar } from '@cognite/cogs.js';
import { Slicer } from 'app/containers/ThreeD/slicer/Slicer';
import PointSizeSlider from './point-size-slider/PointSizeSlider';

export const ThreeDPreview = ({
  threeDId,
  actions,
}: {
  threeDId: number;
  actions?: React.ReactNode;
}) => {
  const { id } = useParams<{ id: string }>();
  const modelId = parseInt(id!, 10);

  const { data: apiThreeDModel, isLoading } = use3DModel(modelId);
  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  const [selectedAssetId, setSelectedAssetId] = useSearchParamNumber('assetId');
  const { data: revision } = useDefault3DModelRevision(modelId);

  return (
    <>
      <PageTitle title={isLoading ? '...' : apiThreeDModel?.name} />
      <ResourceTitleRow
        title={apiThreeDModel?.name}
        item={{ id: threeDId, type: 'threeD' }}
        afterDefaultActions={actions}
      />
      <PreviewContainer>
        {revision && (
          <Reveal
            key={`${modelId}.${revision.id}`}
            modelId={modelId}
            revisionId={revision.id}
            focusAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
          >
            {({ pointCloudModel, threeDModel, viewer, boundingBox }) => {
              const model = pointCloudModel || threeDModel;
              return (
                <>
                  <SidebarContainer gap={15}>
                    {threeDModel && (
                      <AssetMappingsSidebar
                        modelId={modelId}
                        revisionId={revision.id}
                        selectedAssetId={selectedAssetId}
                        setSelectedAssetId={setSelectedAssetId}
                      />
                    )}
                  </SidebarContainer>
                  {model && (
                    <StyledToolBar>
                      {threeDModel && (
                        <ExpandButton
                          viewer={viewer}
                          viewerModel={threeDModel}
                        />
                      )}
                      {threeDModel && selectedAssetId && (
                        <FocusAssetButton
                          boundingBox={boundingBox}
                          viewer={viewer}
                          viewerModel={threeDModel}
                        />
                      )}
                      {model && <Slicer viewer={viewer} viewerModel={model} />}
                      {pointCloudModel && (
                        <PointSizeSlider model={pointCloudModel} />
                      )}
                    </StyledToolBar>
                  )}
                </>
              );
            }}
          </Reveal>
        )}
        <AssetPreviewSidebar
          assetId={selectedAssetId}
          isBackButtonAvailable={false}
        />
      </PreviewContainer>
    </>
  );
};

const StyledToolBar = styled(ToolBar)`
  position: relative;
  left: 30px;
  bottom: 250px;
  height: 150px;
`;

const SidebarContainer = styled(Flex)`
  position: absolute;
  width: 300px;
  top: 100px;
  left: 30px;
  z-index: 100;
  overflow: hidden;
`;

const PreviewContainer = styled.div`
  height: calc(100% - 85px);
  width: calc(100% - 14px);
`;
