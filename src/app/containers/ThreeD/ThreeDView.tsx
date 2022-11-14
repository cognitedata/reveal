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
  PointToPointMeasurementButton,
} from './ThreeDToolbar';
import { Slicer } from './slicer/Slicer';
import PointSizeSlider from './point-size-slider/PointSizeSlider';
import HelpButton from './help-button';
import styled from 'styled-components';
import { Flex, ToolBar } from '@cognite/cogs.js';
import ThreeDTitle from './ThreeDTitle';
import NodePreview from './NodePreview';
import {
  findClosestAsset,
  fitCameraToAsset,
  ghostAsset,
  highlightAsset,
  outlineAssetMappedNodes,
  removeAllStyles,
} from './utils';

import { CadIntersection, Intersection } from '@cognite/reveal';
import { AssetPreviewSidebar } from './AssetPreviewSidebar';
import { StyledSplitter } from '../elements';
import { useSDK } from '@cognite/sdk-provider';
import { useQueryClient } from 'react-query';
import { ThreeDContext } from './ThreeDContext';
import debounce from 'lodash/debounce';
import ShareButton from './share-button';
import MouseWheelAction from 'app/containers/ThreeD/components/MouseWheelAction';

type Props = {
  modelId: number;
  revisionId: number;
};
export const ThreeDView = ({ modelId, revisionId }: Props) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  useEffect(() => {
    trackUsage('3DPreview.Open', { modelId });
  }, [modelId]);

  const context = useContext(ThreeDContext);
  const {
    viewer,
    threeDModel,
    assetDetailsExpanded,
    setAssetDetailsExpanded,
    splitterColumnWidth,
    setSplitterColumnWidth,
  } = context;

  const { viewState, setViewState, selectedAssetId, setSelectedAssetId } =
    context;
  // Changes to the view state in the url should not cause any updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialUrlViewState = useMemo(() => viewState, []);

  const [nodesSelectable, setNodesSelectable] = useState<boolean>(true);

  useEffect(() => {
    if (viewer && setViewState) {
      const fn = debounce(() => {
        setViewState(viewer.getViewState());
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
            revisionId,
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

  useEffect(() => {
    if (!selectedAssetId) {
      setAssetDetailsExpanded(false);
    }
  }, [selectedAssetId, setAssetDetailsExpanded]);

  // Hack to avoid having an initial selectedAssetId overwriting viewState
  const [firstRender, setFirstRender] = useState(true);
  useEffect(() => {
    if (!viewer || !threeDModel) {
      return;
    }
    if (firstRender && viewState) {
      setFirstRender(false);
      return;
    }
    setFirstRender(false);

    if (selectedAssetId) {
      if (assetDetailsExpanded) {
        ghostAsset(sdk, threeDModel, selectedAssetId);
      } else {
        highlightAsset(sdk, threeDModel, selectedAssetId);
      }
      fitCameraToAsset(
        sdk,
        queryClient,
        viewer,
        threeDModel,
        modelId,
        revisionId,
        selectedAssetId
      );
    } else {
      removeAllStyles(threeDModel);
      outlineAssetMappedNodes(threeDModel);
    }
    // Ignore changes to `viewState` and `firstRender`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    assetDetailsExpanded,
    modelId,
    queryClient,
    revisionId,
    sdk,
    selectedAssetId,
    threeDModel,
    viewer,
  ]);

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
                <MouseWheelAction
                  isAssetSelected={!!selectedAssetId}
                  viewer={viewer}
                />
                <StyledToolBar>
                  <ExpandButton viewer={viewer} threeDModel={threeDModel} />
                  <FocusAssetButton
                    modelId={modelId}
                    revisionId={revisionId}
                    selectedAssetId={selectedAssetId}
                    viewer={viewer}
                    threeDModel={threeDModel}
                  />
                  <Slicer
                    viewer={viewer}
                    viewerModel={threeDModel || pointCloudModel}
                  />
                  <PointSizeSlider pointCloudModel={pointCloudModel} />
                  <ShareButton
                    viewState={viewState}
                    selectedAssetId={selectedAssetId}
                    assetDetailsExpanded={assetDetailsExpanded}
                  />
                  <PointToPointMeasurementButton
                    viewer={viewer}
                    nodesSelectable={nodesSelectable}
                    setNodesSelectable={setNodesSelectable}
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
                      openDetails={() => {
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
