import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';

import { trackUsage } from 'app/utils/Metrics';
import Reveal from './Reveal';
import { AssetMappingsSidebar } from './AssetMappingsSidebar';
import {
  ExpandButton,
  FocusAssetButton,
  HelpButton,
  PointToPointMeasurementButton,
  ShareButton,
} from './toolbar';
import { Slicer } from './slicer/Slicer';
import PointSizeSlider from './point-size-slider/PointSizeSlider';

import styled from 'styled-components';
import { Colors, Flex } from '@cognite/cogs.js';
import { ThreeDTitle } from './title/ThreeDTitle';
import NodePreview, { ResourceTabType } from './NodePreview';
import {
  findClosestAsset,
  fitCameraToAsset,
  ghostAsset,
  highlightAsset,
  highlightAssetMappedNodes,
  removeAllStyles,
} from './utils';

import { CadIntersection, Intersection } from '@cognite/reveal';
import { AssetPreviewSidebar } from './AssetPreviewSidebar';
import { StyledSplitter } from '../elements';
import { useSDK } from '@cognite/sdk-provider';
import { useQueryClient } from 'react-query';
import { ThreeDContext } from './ThreeDContext';
import debounce from 'lodash/debounce';

import AssetsHighlightButton from 'app/containers/ThreeD/assets-highlight-button/AssetsHighlightButton';
import { LabelEventHandler } from 'app/containers/ThreeD/tools/SmartOverlayTool';

import MouseWheelAction from 'app/containers/ThreeD/components/MouseWheelAction';
import LoadSecondaryModels from 'app/containers/ThreeD/load-secondary-models/LoadSecondaryModels';
import OverlayTool from 'app/containers/ThreeD/components/OverlayTool';
import { useFlagAssetMappingsOverlays } from 'app/hooks/flags';

type Props = {
  modelId: number;
};
export const ThreeDView = ({ modelId }: Props) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const useOverlays = useFlagAssetMappingsOverlays();

  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  const context = useContext(ThreeDContext);
  const {
    viewer,
    threeDModel,
    assetDetailsExpanded,
    assetHighlightMode,
    setAssetDetailsExpanded,
    splitterColumnWidth,
    setSplitterColumnWidth,
    revisionId,
    tab,
    setTab,
    secondaryModels,
    viewState,
    setViewState,
    selectedAssetId,
    setSelectedAssetId,
    overlayTool,
  } = context;

  // Changes to the view state in the url should not cause any updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialUrlViewState = useMemo(() => viewState, []);

  const [nodesSelectable, setNodesSelectable] = useState<boolean>(true);

  useEffect(() => {
    if (viewer && setViewState) {
      const fn = debounce(() => {
        const currentState = viewer.getViewState();
        setViewState({ camera: currentState.camera });
      }, 500);
      viewer.on('sceneRendered', fn);
      return () => viewer.off('sceneRendered', fn);
    }
  }, [setViewState, viewer]);

  const onViewerClick = useCallback(
    (intersection: Intersection | null) => {
      (async () => {
        let closestAssetId: number | undefined;
        if (intersection) {
          closestAssetId = await findClosestAsset(
            sdk,
            queryClient,
            threeDModel!,
            modelId,
            revisionId!,
            intersection as CadIntersection
          );
        }

        if (closestAssetId && closestAssetId !== selectedAssetId) {
          setSelectedAssetId(closestAssetId);
        } else if (!closestAssetId) {
          setSelectedAssetId(undefined);
        }
      })();
    },
    [
      modelId,
      queryClient,
      revisionId,
      sdk,
      selectedAssetId,
      setSelectedAssetId,
      threeDModel,
    ]
  );

  const onLabelClick: LabelEventHandler = useCallback(
    event => {
      setSelectedAssetId(event.targetLabel.id);
    },
    [setSelectedAssetId]
  );

  useEffect(() => {
    if (!selectedAssetId) {
      setAssetDetailsExpanded(false);
    }
  }, [selectedAssetId, setAssetDetailsExpanded]);

  const [labelsVisibility, setLabelsVisibility] = useState(
    useOverlays ? assetHighlightMode : false
  );

  useEffect(() => {
    if (!viewer || !threeDModel || !overlayTool) {
      return;
    }
    removeAllStyles(threeDModel);

    if (selectedAssetId) {
      if (assetDetailsExpanded) {
        ghostAsset(sdk, threeDModel, selectedAssetId, queryClient);
        overlayTool.visible = false;
      } else {
        overlayTool.visible = labelsVisibility;
        if (assetHighlightMode) {
          highlightAssetMappedNodes(threeDModel, queryClient);
        }
        highlightAsset(sdk, threeDModel, selectedAssetId, queryClient);
      }
    } else {
      if (assetHighlightMode) {
        highlightAssetMappedNodes(threeDModel, queryClient);
      }
      overlayTool.visible = labelsVisibility;
    }
  }, [
    assetHighlightMode,
    assetDetailsExpanded,
    modelId,
    queryClient,
    revisionId,
    sdk,
    selectedAssetId,
    threeDModel,
    viewer,
    overlayTool,
    labelsVisibility,
  ]);

  useEffect(() => {
    if (!viewer || !threeDModel) {
      return;
    }

    if (selectedAssetId) {
      fitCameraToAsset(sdk, queryClient, viewer, threeDModel, selectedAssetId);
    }
  }, [queryClient, sdk, selectedAssetId, threeDModel, viewer]);

  if (!revisionId) {
    return null;
  }

  return (
    <>
      <ThreeDTitle id={modelId} />
      <PreviewContainer>
        <StyledSplitter
          secondaryInitialSize={splitterColumnWidth}
          onSecondaryPaneSizeChange={setSplitterColumnWidth}
          secondaryMinSize={200}
        >
          <Reveal
            key={`${modelId}.${revisionId}`}
            modelId={modelId}
            revisionId={revisionId}
            nodesSelectable={nodesSelectable && !assetDetailsExpanded}
            initialViewerState={initialUrlViewState}
            onViewerClick={onViewerClick}
          >
            {({ pointCloudModel, threeDModel, viewer }) => (
              <>
                <LoadSecondaryModels
                  secondaryModels={secondaryModels}
                  viewer={viewer}
                />
                <MouseWheelAction
                  isAssetSelected={!!selectedAssetId}
                  viewer={viewer}
                />
                <OverlayTool viewer={viewer} onLabelClick={onLabelClick} />
                <StyledToolBar>
                  <ExpandButton
                    viewer={viewer}
                    model={threeDModel || pointCloudModel}
                  />
                  <FocusAssetButton
                    selectedAssetId={selectedAssetId}
                    viewer={viewer}
                    threeDModel={threeDModel}
                  />
                  <StyledToolBarDivider />
                  <PointSizeSlider pointCloudModel={pointCloudModel} />
                  {!assetDetailsExpanded && (
                    <AssetsHighlightButton
                      labelsVisibility={labelsVisibility}
                      setLabelsVisibility={setLabelsVisibility}
                      overlayTool={overlayTool}
                      threeDModel={threeDModel}
                    />
                  )}
                  <Slicer
                    viewer={viewer}
                    viewerModel={threeDModel || pointCloudModel}
                  />
                  <PointToPointMeasurementButton
                    viewer={viewer}
                    nodesSelectable={nodesSelectable}
                    setNodesSelectable={setNodesSelectable}
                  />
                  <StyledToolBarDivider />
                  <ShareButton
                    viewState={viewState}
                    selectedAssetId={selectedAssetId}
                    assetDetailsExpanded={assetDetailsExpanded}
                    secondaryModels={secondaryModels}
                  />
                  <HelpButton />
                </StyledToolBar>
                <SidebarContainer gap={15}>
                  {threeDModel && (
                    <AssetMappingsSidebar
                      modelId={modelId}
                      revisionId={revisionId}
                      selectedAssetId={selectedAssetId}
                      setSelectedAssetId={setSelectedAssetId}
                      viewer={viewer}
                      threeDModel={threeDModel}
                    />
                  )}
                </SidebarContainer>
                {!!selectedAssetId && !assetDetailsExpanded && (
                  <NodePreviewContainer>
                    <NodePreview
                      assetId={selectedAssetId}
                      closePreview={() => {
                        setSelectedAssetId(undefined);
                      }}
                      openDetails={(tab?: ResourceTabType) => {
                        setTab(tab);
                        setAssetDetailsExpanded(true);
                      }}
                    />
                  </NodePreviewContainer>
                )}
              </>
            )}
          </Reveal>
          {!!selectedAssetId && threeDModel && assetDetailsExpanded && (
            <AssetPreviewSidebar
              assetId={selectedAssetId}
              onClose={() => {
                setAssetDetailsExpanded(false);
              }}
              tab={tab}
            />
          )}
        </StyledSplitter>
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

const StyledToolBar = styled.div`
  position: absolute;
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  width: fit-content;
  height: fit-content;
  padding: 4px;
  border-radius: 4px;
  background-color: white;
  width: 48px;
`;

const StyledToolBarDivider = styled.div`
  background-color: ${Colors['border--interactive--default']};
  height: 1px;
  width: 40px;
  margin: 4px 0;

  :first-child,
  :last-child {
    display: none;
  }
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
