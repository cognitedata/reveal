import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';

import styled from 'styled-components';

import { useQueryClient } from '@tanstack/react-query';

import { Colors, Flex } from '@cognite/cogs.js';
import {
  CogniteCadModel,
  CogniteModel,
  CognitePointCloudModel,
  Image360,
  Image360AnnotationIntersection,
  Image360Collection,
  Intersection,
} from '@cognite/reveal';
import { Image360HistoricalDetails } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import AssetsHighlightButton from '@data-exploration-app/containers/ThreeD/assets-highlight-button/AssetsHighlightButton';
import MouseWheelAction from '@data-exploration-app/containers/ThreeD/components/MouseWheelAction';
import OverlayTool from '@data-exploration-app/containers/ThreeD/components/OverlayTool';
import LoadSecondaryModels from '@data-exploration-app/containers/ThreeD/load-secondary-models/LoadSecondaryModels';
import { LabelEventHandler } from '@data-exploration-app/containers/ThreeD/tools/SmartOverlayTool';
import { useJourney } from '@data-exploration-app/hooks';
import {
  useFlagAssetMappingsOverlays,
  useFlagPointCloudSearch,
  useFlagPointsOfInterestFeature,
} from '@data-exploration-app/hooks/flags';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { PREVIEW_SIDEBAR_MIN_WIDTH } from '@data-exploration-lib/core';

import zIndex from '../../utils/zIndex';
import { StyledSplitter } from '../elements';
import { DetailsOverlay } from '../Exploration/DetailsOverlay';

import { AssetMappingsSidebar } from './AssetMappingsSidebar';
import { ThreeDContext } from './contexts/ThreeDContext';
import HighQualityToggle from './high-quality-toggle/HighQualityToggle';
import LoadImages360 from './load-secondary-models/LoadImages360';
import PointsOfInterestLoader from './load-secondary-models/PointsOfInterestLoader';
import NodePreview, { ResourceTabType } from './NodePreview';
import PointSizeSlider from './point-size-slider/PointSizeSlider';
import Reveal from './Reveal';
import { Slicer } from './slicer/Slicer';
import { StylingState } from './StylingState';
import { ThreeDTitle } from './title/ThreeDTitle';
import {
  ExpandButton,
  FocusAssetButton,
  HelpButton,
  PointToPointMeasurementButton,
  ShareButton,
} from './toolbar';
import {
  AssetSelectionState,
  findClosestAsset,
  fitCameraToAsset,
  getAssetIdFromImageAnnotation,
  isCadIntersection,
} from './utils';

type Props = {
  modelId?: number;
  image360SiteId?: string;
};

export const ThreeDView = ({ modelId, image360SiteId }: Props) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  const useOverlays = useFlagAssetMappingsOverlays();
  const pointCloudSearchFeatureFlag = useFlagPointCloudSearch();
  const usePointsOfInterestFeatureFlag = useFlagPointsOfInterestFeature();

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

  const {
    viewer,
    cadModel,
    pointCloudModel,
    assetDetailsExpanded,
    assetHighlightMode,
    setAssetDetailsExpanded,
    splitterColumnWidth,
    setSplitterColumnWidth,
    revisionId,
    secondaryModels,
    viewState,
    images360,
    selectedAssetId,
    pointsOfInterest,
    setSelectedAssetId,
    overlayTool,
    secondaryObjectsVisibilityState,
    image360,
  } = useContext(ThreeDContext);

  const model = cadModel ?? pointCloudModel ?? image360;

  // Changes to the view state in the url should not cause any updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialUrlViewState = useMemo(() => viewState, []);

  const [nodesSelectable, setNodesSelectable] = useState<boolean>(true);

  const [image360Entity, setImage360Entity] = useState<Image360 | undefined>(
    undefined
  );

  const [enteredImage360Collection, setEnteredImage360Collection] = useState<
    Image360Collection | undefined
  >(undefined);

  const [loadedSecondaryModels, setLoadedSecondaryModels] = useState<
    (CogniteCadModel | CognitePointCloudModel)[]
  >([]);

  const [is360HistoricalPanelExpanded, setIs360HistoricalPanelExpanded] =
    useState<boolean>(false);

  const handleExpand = useCallback((isExpanded: boolean) => {
    setIs360HistoricalPanelExpanded(isExpanded);
  }, []);

  const [clickedModel, setClickedModel] = useState<
    CogniteModel | Image360Collection | undefined
  >();

  const setSelectedAssetAndFitCamera = useCallback(
    (
      newSelectedAssetId: number | undefined,
      assetSelectionState: AssetSelectionState
    ) => {
      setSelectedAssetId(newSelectedAssetId);
      if (
        newSelectedAssetId !== undefined &&
        viewer !== undefined &&
        model !== undefined
      ) {
        fitCameraToAsset(
          sdk,
          queryClient,
          viewer,
          assetSelectionState,
          newSelectedAssetId
        );
      }
    },
    [sdk, queryClient, viewer, model, setSelectedAssetId]
  );

  const onViewerClick = useCallback(
    (
      intersection: Intersection | null,
      image360AnnotationIntersection: Image360AnnotationIntersection | null
    ) => {
      (async () => {
        let closestAssetId: number | undefined;
        const assetSelectionState: AssetSelectionState = {
          model: model!,
        };

        if (
          image360AnnotationIntersection &&
          enteredImage360Collection !== undefined
        ) {
          closestAssetId = getAssetIdFromImageAnnotation(
            image360AnnotationIntersection.annotation.annotation
          );

          assetSelectionState.imageAnnotation =
            image360AnnotationIntersection.annotation;
          assetSelectionState.model = enteredImage360Collection;

          setClickedModel(enteredImage360Collection);
        }

        if (
          !closestAssetId &&
          intersection &&
          isCadIntersection(intersection) &&
          modelId
        ) {
          closestAssetId = await findClosestAsset(
            sdk,
            queryClient,
            intersection.model,
            modelId,
            revisionId!,
            intersection
          );

          assetSelectionState.model = intersection.model;

          setClickedModel(intersection.model);
        }

        if (closestAssetId && closestAssetId !== selectedAssetId) {
          trackUsage(EXPLORATION.THREED_ACTION.ASSET_SELECTED, {
            closestAssetId,
            resourceType: '3D',
          });
        } else if (!closestAssetId) {
          trackUsage(EXPLORATION.THREED_SELECT.UNCLICKABLE_OBJECT, {
            modelId: cadModel?.modelId,
            resourceType: '3D',
          });
        }

        setSelectedAssetAndFitCamera(closestAssetId, assetSelectionState);
      })();
    },
    [
      modelId,
      queryClient,
      revisionId,
      sdk,
      selectedAssetId,
      setSelectedAssetAndFitCamera,
      cadModel,
      enteredImage360Collection,
    ]
  );

  const onLabelClick: LabelEventHandler = useCallback(
    (event) => {
      setSelectedAssetId(event.targetLabel.id);
    },
    [setSelectedAssetId]
  );

  const [journey, setJourney] = useJourney();

  useEffect(() => {
    if (!selectedAssetId || journey === undefined) {
      setAssetDetailsExpanded(false);
    } else {
      setAssetDetailsExpanded(true);
    }
  }, [selectedAssetId, setAssetDetailsExpanded, journey]);

  const [labelsVisibility, setLabelsVisibility] = useState(
    useOverlays ? assetHighlightMode : false
  );

  const [stylingState, setStylingState] = useState<StylingState | undefined>();

  useEffect(() => {
    if (
      viewer === undefined ||
      model === undefined ||
      overlayTool === undefined
    ) {
      return;
    }

    const newStylingState = new StylingState(
      clickedModel ?? model,
      sdk,
      viewer,
      queryClient,
      overlayTool
    );

    setStylingState(newStylingState);

    return () => {
      newStylingState.resetStyles();
    };
  }, [sdk, viewer, queryClient, overlayTool, model, clickedModel]);

  useEffect(() => {
    stylingState?.updateState(
      selectedAssetId,
      assetDetailsExpanded,
      labelsVisibility,
      assetHighlightMode,
      loadedSecondaryModels
    );
  }, [
    assetHighlightMode,
    assetDetailsExpanded,
    selectedAssetId,
    labelsVisibility,
    loadedSecondaryModels,
    stylingState,
  ]);

  if (!revisionId && !image360SiteId) {
    return null;
  }
  const shouldShowResourcePreview = !!selectedAssetId && assetDetailsExpanded;

  return (
    <>
      <ThreeDTitle id={modelId} image360SiteId={image360SiteId} />
      <PreviewContainer>
        <StyledSplitter
          secondaryInitialSize={splitterColumnWidth}
          onSecondaryPaneSizeChange={setSplitterColumnWidth}
          secondaryMinSize={PREVIEW_SIDEBAR_MIN_WIDTH}
        >
          <Reveal
            key={`${modelId}.${revisionId}`}
            image360SiteId={image360SiteId}
            modelId={modelId}
            revisionId={revisionId ?? -1}
            nodesSelectable={nodesSelectable && !assetDetailsExpanded}
            initialViewerState={initialUrlViewState}
            setImage360Entity={setImage360Entity}
            setEntered360ImageCollection={setEnteredImage360Collection}
            onViewerClick={onViewerClick}
          >
            {({
              pointCloudModel: revealPointCloudModel,
              threeDModel: revealThreeDModel,
              viewer: revealViewer,
            }) => (
              <>
                <LoadSecondaryModels
                  secondaryModels={secondaryModels}
                  viewer={revealViewer}
                  loadedSecondaryModels={loadedSecondaryModels}
                  setLoadedSecondaryModels={setLoadedSecondaryModels}
                />
                <LoadImages360
                  images360={images360}
                  setImage360Entity={setImage360Entity}
                  setEntered360ImageCollection={setEnteredImage360Collection}
                  viewer={revealViewer}
                />
                {usePointsOfInterestFeatureFlag && (
                  <PointsOfInterestLoader
                    poiList={pointsOfInterest}
                    viewer={revealViewer}
                    secondaryObjectsVisibilityState={
                      secondaryObjectsVisibilityState
                    }
                  />
                )}
                <MouseWheelAction
                  isAssetSelected={!!selectedAssetId}
                  viewer={revealViewer}
                />
                <OverlayTool
                  viewer={revealViewer}
                  onLabelClick={onLabelClick}
                />
                {!image360Entity && (
                  <StyledToolBar>
                    <ExpandButton
                      viewer={revealViewer}
                      model={revealThreeDModel ?? revealPointCloudModel}
                    />
                    <FocusAssetButton
                      selectedAssetId={selectedAssetId}
                      viewer={revealViewer}
                      threeDModel={revealThreeDModel ?? image360}
                    />
                    <StyledToolBarDivider />
                    <PointSizeSlider
                      pointCloudModel={revealPointCloudModel}
                      viewer={revealViewer}
                    />
                    <Slicer
                      viewer={revealViewer}
                      viewerModel={revealThreeDModel ?? revealPointCloudModel}
                    />
                    <PointToPointMeasurementButton
                      model={revealThreeDModel ?? revealPointCloudModel}
                      viewer={revealViewer}
                      nodesSelectable={nodesSelectable}
                      setNodesSelectable={setNodesSelectable}
                    />
                    {!assetDetailsExpanded && (
                      <AssetsHighlightButton
                        labelsVisibility={labelsVisibility}
                        setLabelsVisibility={setLabelsVisibility}
                        overlayTool={overlayTool}
                        threeDModel={revealThreeDModel}
                      />
                    )}
                    <StyledToolBarDivider />
                    <HighQualityToggle viewer={revealViewer} />
                    <ShareButton />
                    <HelpButton />
                  </StyledToolBar>
                )}
                <Image360HistoricalPanel
                  isExpanded={is360HistoricalPanelExpanded}
                >
                  {image360Entity && (
                    <Image360HistoricalDetails
                      viewer={revealViewer}
                      image360Entity={image360Entity!}
                      onExpand={handleExpand}
                    />
                  )}
                </Image360HistoricalPanel>
                <SidebarContainer gap={15}>
                  {(revealThreeDModel ||
                    image360 ||
                    (revealPointCloudModel && pointCloudSearchFeatureFlag)) && (
                    <AssetMappingsSidebar
                      modelId={modelId}
                      revisionId={revisionId}
                      selectedAssetId={selectedAssetId}
                      setSelectedAssetId={(id) =>
                        setSelectedAssetAndFitCamera(id, {
                          model: model!,
                          imageEntity: image360Entity,
                        })
                      }
                      viewer={revealViewer}
                      threeDModel={model}
                    />
                  )}
                </SidebarContainer>
                {!!selectedAssetId && !shouldShowResourcePreview && (
                  <NodePreviewContainer>
                    <NodePreview
                      assetId={selectedAssetId}
                      closePreview={() => {
                        setSelectedAssetId(undefined);
                      }}
                      openDetails={(newTab?: ResourceTabType) => {
                        setJourney([
                          {
                            type: 'asset',
                            id: selectedAssetId,
                            selectedTab: newTab,
                          },
                        ]);
                      }}
                    />
                  </NodePreviewContainer>
                )}
              </>
            )}
          </Reveal>
          {shouldShowResourcePreview && <DetailsOverlay />}
        </StyledSplitter>
      </PreviewContainer>
    </>
  );
};

const Image360HistoricalPanel = styled.div<{ isExpanded: boolean }>`
  position: absolute;
  bottom: ${({ isExpanded }) => (isExpanded ? '0px' : '40px')};
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: fit-content;
  max-width: 100%;
  min-width: fill-available;
  transition: transform 0.25s ease-in-out;
  transform: ${({ isExpanded }) =>
    isExpanded ? 'translateY(0)' : 'translateY(100%)'};
`;

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
