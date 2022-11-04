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
import {
  parseThreeDViewerStateFromURL,
  removeAllStyles,
  THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY,
} from './utils';
import { useSearchParamNumber } from 'app/utils/URLUtils';

export const ThreeDView = ({ modelId }: { modelId: number }) => {
  const [urlState, setUrlState] =
    useState<ReturnType<typeof parseThreeDViewerStateFromURL>>();
  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  useEffect(() => {
    setUrlState(parseThreeDViewerStateFromURL());
  }, []);

  const [selectedAssetId, setSelectedAssetId] = useSearchParamNumber(
    THREE_D_SELECTED_ASSET_QUERY_PARAMETER_KEY,
    {
      replace: true,
    }
  );
  const [nodesSelectable, setNodesSelectable] = useState<boolean>(true);

  const [assetDetailsExpanded, setAssetDetailsExpanded] = useState(false);

  useEffect(() => {
    if (!selectedAssetId) {
      setAssetDetailsExpanded(false);
    }
  }, [selectedAssetId]);

  const { data: revision } = useDefault3DModelRevision(modelId);

  return (
    <>
      <ThreeDTitle id={modelId} />
      <PreviewContainer>
        {revision && (
          <Reveal
            key={`${modelId}.${revision.id}`}
            modelId={modelId}
            revisionId={revision.id}
            setSelectedAssetId={setSelectedAssetId}
            nodesSelectable={nodesSelectable && !assetDetailsExpanded}
            assetColumnVisible={
              Number.isFinite(selectedAssetId) && assetDetailsExpanded
            }
            onAssetColumnClose={() => setAssetDetailsExpanded(false)}
            selectedAsset={selectedAssetId}
            initialViewerState={urlState?.viewerState}
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
                      <ShareButton viewer={viewer} />
                      <HelpButton />
                    </StyledToolBar>
                  )}
                  {!!selectedAssetId && !assetDetailsExpanded && (
                    <NodePreviewContainer>
                      <NodePreview
                        assetId={selectedAssetId}
                        closePreview={() => {
                          setAssetDetailsExpanded(false);
                          setSelectedAssetId(null);
                          if (threeDModel) {
                            removeAllStyles(threeDModel);
                          }
                        }}
                        openDetails={() => {
                          setAssetDetailsExpanded(true);
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
