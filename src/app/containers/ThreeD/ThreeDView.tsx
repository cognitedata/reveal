import React, { useEffect, useState } from 'react';

import { useDefault3DModelRevision } from './hooks';
import { trackUsage } from 'app/utils/Metrics';
import { useSearchParamNumber } from 'app/utils/URLUtils';
import { StyledSplitter } from '../elements';
import Reveal from './Reveal';
import { AssetMappingsSidebar } from './AssetMappingsSidebar';
import {
  ExpandButton,
  FocusAssetButton,
  PointToPointMeasurementButton,
} from './ThreeDToolbar';
import { Slicer } from './slicer/Slicer';
import PointSizeSlider from './point-size-slider/PointSizeSlider';
import HelpButton from './help-button';
import { AssetPreviewSidebar } from './AssetPreviewSidebar';
import styled from 'styled-components';
import { Flex, ToolBar } from '@cognite/cogs.js';
import ThreeDTitle from './ThreeDTitle';

export const ThreeDView = ({ modelId }: { modelId: number }) => {
  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  const [selectedAssetId, setSelectedAssetId] = useSearchParamNumber('assetId');
  const { data: revision } = useDefault3DModelRevision(modelId);
  const [assetPreviewSidebarVisible, setAssetPreviewSidebarVisible] = useState(
    !!selectedAssetId
  );

  return (
    <>
      <ThreeDTitle id={modelId} />
      <PreviewContainer>
        <StyledSplitter primaryIndex={0}>
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
                          setAssetPreviewSidebarVisible={
                            setAssetPreviewSidebarVisible
                          }
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
                        {model && (
                          <Slicer viewer={viewer} viewerModel={model} />
                        )}
                        {pointCloudModel && (
                          <PointSizeSlider model={pointCloudModel} />
                        )}
                        <PointToPointMeasurementButton viewer={viewer} />
                        <HelpButton />
                      </StyledToolBar>
                    )}
                  </>
                );
              }}
            </Reveal>
          )}
          {!!assetPreviewSidebarVisible && selectedAssetId && (
            <AssetPreviewSidebar
              assetId={selectedAssetId}
              onClose={() => setSelectedAssetId(null)}
            />
          )}
        </StyledSplitter>
      </PreviewContainer>
    </>
  );
};

const StyledToolBar = styled(ToolBar)`
  position: absolute;
  left: 30px;
  bottom: 30px;
  display: table-cell;
  width: fit-content;
  height: fit-content;
`;

const SidebarContainer = styled(Flex)`
  position: absolute;
  width: auto;
  height: auto;
  top: 30px;
  left: 30px;
  z-index: 100;
  overflow: hidden;
`;

const PreviewContainer = styled.div`
  height: 100%;
  display: contents;
`;
