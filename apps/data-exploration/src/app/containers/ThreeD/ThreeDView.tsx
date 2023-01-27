import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';

import { trackUsage } from '@data-exploration-app/utils/Metrics';
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
  isCadIntersection,
  removeAllStyles,
} from './utils';

import {
  CogniteCadModel,
  CognitePointCloudModel,
  Image360Collection,
  Intersection,
} from '@cognite/reveal';
import { AssetPreviewSidebar } from './AssetPreviewSidebar';
import { StyledSplitter } from '../elements';
import { useSDK } from '@cognite/sdk-provider';
import { useQueryClient } from 'react-query';
import { ThreeDContext } from './ThreeDContext';
import debounce from 'lodash/debounce';

import AssetsHighlightButton from '@data-exploration-app/containers/ThreeD/assets-highlight-button/AssetsHighlightButton';
import { LabelEventHandler } from '@data-exploration-app/containers/ThreeD/tools/SmartOverlayTool';

import MouseWheelAction from '@data-exploration-app/containers/ThreeD/components/MouseWheelAction';
import LoadSecondaryModels from '@data-exploration-app/containers/ThreeD/load-secondary-models/LoadSecondaryModels';
import OverlayTool from '@data-exploration-app/containers/ThreeD/components/OverlayTool';
import { useFlagAssetMappingsOverlays } from '@data-exploration-app/hooks/flags';
import LoadImages360 from './load-secondary-models/LoadImages360';
import zIndex from '../../utils/zIndex';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';

type Props = {
  modelId?: number;
  image360SiteId?: string;
};
export const ThreeDView = ({ modelId, image360SiteId }: Props) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const useOverlays = useFlagAssetMappingsOverlays();

  useEffect(() => {
    if (modelId) {
      trackUsage(EXPLORATION.THREED_ACTION.MODEL_SELECTED, {
        modelId,
        resourceType: '3D',
      });
    }
  }, [modelId]);

  useEffect(() => {
    if (image360SiteId) {
      trackUsage(EXPLORATION.THREED_ACTION.IMAGE_360_SELECTED, {
        image360SiteId,
        resourceType: '3D',
      });
    }
  }, [image360SiteId]);

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
    images360,
    selectedAssetId,
    setSelectedAssetId,
    overlayTool,
  } = context;

  // Changes to the view state in the url should not cause any updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialUrlViewState = useMemo(() => viewState, []);

  const [nodesSelectable, setNodesSelectable] = useState<boolean>(true);

  const [imageEntities, setImageEntities] = useState<
    { siteId: string; images: Image360Collection }[]
  >([]);

  const [is360ImagesMode, setIs360ImagesMode] = useState<boolean>(false);

  useEffect(() => {
    if (viewer && setViewState) {
      const fn = debounce(() => {
        const currentState = viewer.getViewState();
        setViewState({ camera: currentState.camera });
      }, 250);
      viewer.on('sceneRendered', fn);
      return () => viewer.off('sceneRendered', fn);
    }

    return undefined;
  }, [setViewState, viewer]);

  const onViewerClick = useCallback(
    (intersection: Intersection | null) => {
      (async () => {
        let closestAssetId: number | undefined;
        if (intersection && isCadIntersection(intersection) && modelId) {
          closestAssetId = await findClosestAsset(
            sdk,
            queryClient,
            threeDModel!,
            modelId,
            revisionId!,
            intersection
          );
        }

        if (closestAssetId && closestAssetId !== selectedAssetId) {
          setSelectedAssetId(closestAssetId);
          trackUsage(EXPLORATION.THREED_ACTION.ASSET_SELECTED, {
            closestAssetId,
            resourceType: '3D',
          });
        } else if (!closestAssetId) {
          setSelectedAssetId(undefined);
          trackUsage(EXPLORATION.THREED_SELECT.UNCLICKABLE_OBJECT, {
            modelId: threeDModel?.modelId,
            resourceType: '3D',
          });
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
    (event) => {
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

    const hasAdded = (
      viewer.models as (CogniteCadModel | CognitePointCloudModel)[]
    ).some(
      ({ modelId: tmId, revisionId: trId }) =>
        threeDModel.modelId === tmId && threeDModel.revisionId === trId
    );
    if (!hasAdded) {
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

  if (!revisionId && !image360SiteId) {
    return null;
  }

  return (
    <>
      <ThreeDTitle id={modelId} image360SiteId={image360SiteId} />
      <PreviewContainer>
        <StyledSplitter
          secondaryInitialSize={splitterColumnWidth}
          onSecondaryPaneSizeChange={setSplitterColumnWidth}
          secondaryMinSize={200}
        >
          <Reveal
            key={`${modelId}.${revisionId}`}
            image360SiteId={image360SiteId}
            modelId={modelId}
            revisionId={revisionId ?? -1}
            nodesSelectable={nodesSelectable && !assetDetailsExpanded}
            initialViewerState={initialUrlViewState}
            onViewerClick={onViewerClick}
          >
            {({
              pointCloudModel,
              threeDModel: revealThreeDModel,
              viewer: revealViewer,
            }) => (
              <>
                <LoadSecondaryModels
                  secondaryModels={secondaryModels}
                  viewer={revealViewer}
                />
                <LoadImages360
                  images360={images360}
                  imageEntities={imageEntities}
                  setImageEntities={setImageEntities}
                  is360ImagesMode={is360ImagesMode}
                  setIs360ImagesMode={setIs360ImagesMode}
                  viewer={revealViewer}
                />
                <MouseWheelAction
                  isAssetSelected={!!selectedAssetId}
                  viewer={revealViewer}
                />
                <OverlayTool
                  viewer={revealViewer}
                  onLabelClick={onLabelClick}
                />
                <StyledToolBar>
                  {!is360ImagesMode && (
                    <>
                      <ExpandButton
                        viewer={revealViewer}
                        model={revealThreeDModel || pointCloudModel}
                      />
                      <FocusAssetButton
                        selectedAssetId={selectedAssetId}
                        viewer={revealViewer}
                        threeDModel={revealThreeDModel}
                      />
                      <StyledToolBarDivider />
                      <PointSizeSlider
                        pointCloudModel={pointCloudModel}
                        viewer={revealViewer}
                      />
                      <Slicer
                        viewer={revealViewer}
                        viewerModel={revealThreeDModel || pointCloudModel}
                      />
                      <PointToPointMeasurementButton
                        model={revealThreeDModel ?? pointCloudModel}
                        viewer={revealViewer}
                        nodesSelectable={nodesSelectable}
                        setNodesSelectable={setNodesSelectable}
                      />
                    </>
                  )}
                  {!assetDetailsExpanded && !is360ImagesMode && (
                    <AssetsHighlightButton
                      labelsVisibility={labelsVisibility}
                      setLabelsVisibility={setLabelsVisibility}
                      overlayTool={overlayTool}
                      threeDModel={revealThreeDModel}
                    />
                  )}
                  <StyledToolBarDivider />
                  <ShareButton />
                  <HelpButton />
                </StyledToolBar>
                <SidebarContainer gap={15}>
                  {revealThreeDModel && (
                    <AssetMappingsSidebar
                      modelId={modelId}
                      revisionId={revisionId}
                      selectedAssetId={selectedAssetId}
                      setSelectedAssetId={setSelectedAssetId}
                      viewer={revealViewer}
                      threeDModel={revealThreeDModel}
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
                      openDetails={(newTab?: ResourceTabType) => {
                        setTab(newTab);
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
  z-index: ${zIndex.MAXIMUM};
  overflow: hidden;
`;

const PreviewContainer = styled.div`
  height: 100%;
  display: contents;
`;
