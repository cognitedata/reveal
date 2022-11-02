import React, { useEffect, useState } from 'react';

import { useDefault3DModelRevision } from './hooks';
import { trackUsage } from 'app/utils/Metrics';
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
import styled from 'styled-components';
import { Flex, ToolBar } from '@cognite/cogs.js';
import ThreeDTitle from './ThreeDTitle';
import ShareButton from './share-button';
import NodePreview from './NodePreview';
import { removeAllStyles } from './utils';

export const ThreeDView = ({ modelId }: { modelId: number }) => {
  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  const [selectedAssetId, setSelectedAssetId] = useState<number | undefined>(
    undefined
  );
  const [assetColumnVisible, setAssetColumnVisible] = useState(false);
  const [nodePreviewVisible, setNodePreviewVisible] = useState(
    !!selectedAssetId
  );
  const { data: revision } = useDefault3DModelRevision(modelId);
  const [nodesSelectable, setNodesSelectable] = useState<boolean>(true);

  useEffect(() => {
    if (selectedAssetId) {
      setNodePreviewVisible(true);
    }
  }, [selectedAssetId]);

  return (
    <>
      <ThreeDTitle id={modelId} />
      <PreviewContainer>
        {revision && (
          <Reveal
            key={`${modelId}.${revision.id}`}
            modelId={modelId}
            revisionId={revision.id}
            focusAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
            nodesSelectable={nodesSelectable}
            assetColumnVisible={assetColumnVisible}
          >
            {({ pointCloudModel, threeDModel, viewer }) => {
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
                        viewer={viewer}
                        threeDModel={threeDModel}
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
                          modelId={modelId}
                          revisionId={revision.id}
                          selectedAssetId={selectedAssetId}
                          viewer={viewer}
                          threeDModel={threeDModel}
                        />
                      )}
                      {model && <Slicer viewer={viewer} viewerModel={model} />}
                      {pointCloudModel && (
                        <PointSizeSlider model={pointCloudModel} />
                      )}
                      <PointToPointMeasurementButton
                        viewer={viewer}
                        nodesSelectable={nodesSelectable}
                        setNodesSelectable={setNodesSelectable}
                      />
                      <ShareButton
                        selectedAssetId={selectedAssetId}
                        viewer={viewer}
                      />
                      <HelpButton />
                    </StyledToolBar>
                  )}
                  {nodePreviewVisible && !!selectedAssetId && (
                    <NodePreviewContainer>
                      <NodePreview
                        assetId={selectedAssetId}
                        closePreview={() => {
                          setNodePreviewVisible(false);
                          setSelectedAssetId(undefined);
                          if (threeDModel) {
                            removeAllStyles(threeDModel);
                          }
                        }}
                        openDetails={() => {
                          setNodePreviewVisible(false);
                          setAssetColumnVisible(true);
                        }}
                      />
                    </NodePreviewContainer>
                  )}
                </>
              );
            }}
          </Reveal>
        )}
      </PreviewContainer>
    </>
  );
};

const NodePreviewContainer = styled.div`
  position: absolute;
  right: 30px;
  top: 30px;
  height: 400px;
  width: 300px;
`;

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
