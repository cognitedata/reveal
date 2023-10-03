/* eslint-disable no-param-reassign */
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import styled from 'styled-components';

import * as THREE from 'three';

import {
  ToolBarButton,
  ToolBar,
  Slider,
  Icon,
  Menu,
  IconType,
} from '@cognite/cogs.js';
import {
  CameraControlsOptions,
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  DefaultCameraManager,
  MeasurementTool,
  ResolutionOptions,
} from '@cognite/reveal';

const SliderContainer = styled(Menu)`
  width: 230px;
  flex-direction: row;
  gap: 10px;
`;

const PointSizeSlider = styled(Slider)`
  offset-anchor: right top;
  float: right;
  display: inline;
`;

const ClippingPlaneSlider = styled(Slider)`
  offset-anchor: right top;
  float: right;
  display: inline;
`;
const CenteredIcon = styled(Icon)`
  margin-left: auto;
  margin-right: auto;
  width: 50%;
  margin-top: auto;
  margin-bottom: auto;
  height: 50%;
`;

type Props = {
  viewer: Cognite3DViewer;
  model: CogniteCadModel | CognitePointCloudModel;
  setNodesClickable: Dispatch<SetStateAction<boolean>>;
  nodesClickable: boolean;
  setHighQualityRender: Dispatch<SetStateAction<boolean>>;
  highQualityRender: boolean;
};
export function OverlayToolbar({
  viewer,
  model,
  setNodesClickable,
  nodesClickable,
  setHighQualityRender,
  highQualityRender,
}: Props) {
  const cameraManager = viewer.cameraManager as DefaultCameraManager;

  const [measurementTool, setMeasurementToolState] = useState<MeasurementTool>(
    new MeasurementTool(viewer)
  );
  const [measurementEventsSubscribed, setMeasurementEventsSubscribed] =
    useState(false);
  const [cameraControlsOptions, setCameraControlsOptionsState] =
    useState<CameraControlsOptions>(cameraManager.getCameraControlsOptions());

  useEffect(() => {
    if (viewer) {
      setMeasurementToolState(measurementTool);
      setCameraControlsOptionsState(cameraControlsOptions);
    }
  }, [
    cameraControlsOptions,
    cameraManager,
    measurementTool,
    setNodesClickable,
    viewer,
  ]);

  const defaultsRenderQualityConfig = useMemo(() => {
    return {
      cadBudget: { ...viewer.cadBudget },
      pointCloudBudget: { ...viewer.pointCloudBudget },
      resolutionOptions: {
        maxRenderResolution: 1.4e6,
        movingCameraResolutionFactor: 1,
      } as ResolutionOptions,
    };
  }, [viewer]);

  const buttonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'ExpandAlternative',
        description: 'Fit view',
        onClick: () => viewer.fitCameraToModel(model, 400),
      },
    ],
  ];

  addClippingSlider();
  addPointSizeSliderIfApplicable();
  addPointToPointMeasurement();
  subscribeMeasurementEvents();
  addHighQualityMode();

  return (
    <ToolBar direction="vertical">
      <ToolBar.ButtonGroup buttonGroup={buttonGroups[0]} />
    </ToolBar>
  );

  function addPointSizeSliderIfApplicable() {
    if (model instanceof CognitePointCloudModel) {
      const pointCloudModel = model;
      const pointSizeSlider = (
        <SliderContainer>
          <CenteredIcon type="Dot" />
          <PointSizeSlider
            min={0}
            max={1.0}
            step={0.01}
            defaultValue={model.pointSize}
            onChange={(pointSize) => {
              pointCloudModel.pointSize = pointSize;
            }}
          />
          <CenteredIcon type="DotLarge" />
        </SliderContainer>
      );
      const pointSizeTool: ToolBarButton = {
        icon: 'DotLarge',
        description: 'Point size',
        dropdownContent: pointSizeSlider,
      };
      buttonGroups[0].push(pointSizeTool);
    }
  }

  function addClippingSlider() {
    const bounds = model.getModelBoundingBox();
    const clippingPlaneSlider = (
      <SliderContainer>
        <CenteredIcon type="CubeBottom" />
        <ClippingPlaneSlider
          min={bounds.min.y}
          max={bounds.max.y}
          step={(bounds.max.y - bounds.min.y) / 1000.0}
          defaultValue={bounds.max.y}
          onChange={(clippingYPosition) => {
            viewer.setClippingPlanes([
              new THREE.Plane(new THREE.Vector3(0, -1, 0), clippingYPosition),
            ]);
          }}
        />
        <CenteredIcon type="CubeTop" />
      </SliderContainer>
    );
    const pointSizeTool: ToolBarButton = {
      icon: 'Slice',
      description: 'Slice',
      dropdownContent: clippingPlaneSlider,
    };
    buttonGroups[0].push(pointSizeTool);
  }

  function addPointToPointMeasurement() {
    const measurement = {
      icon: 'Ruler' as IconType,
      toggled: !nodesClickable,
      description: 'Measure distance between two points',
      onClick: () => {
        if (viewer) {
          if (nodesClickable) {
            measurementTool.enterMeasurementMode();
          } else {
            exitMeasurement();
          }
        }
      },
    };

    buttonGroups[0].push(measurement);
  }

  /**
   * Sets mouse cursor, measurement button is toggled on & stores camera contols options value.
   */
  function setMeasurementStartState() {
    cameraManager.setCameraControlsOptions({
      ...cameraControlsOptions,
      changeCameraTargetOnClick: false,
    });
    viewer.domElement.style.cursor = 'crosshair';
    setNodesClickable(false);
  }

  /**
   * Exits from measurement mode & reset the measurement state.
   */
  function exitMeasurement() {
    cameraManager.setCameraControlsOptions({
      ...cameraControlsOptions,
    });
    viewer.domElement.style.cursor = 'default';
    setNodesClickable(true);
    measurementTool.exitMeasurementMode();
  }

  /**
   * Subscribe to measurements events (Only once).
   */
  function subscribeMeasurementEvents() {
    if (!measurementEventsSubscribed) {
      measurementTool.on('added', exitMeasurement);
      measurementTool.on('started', setMeasurementStartState);
      setMeasurementEventsSubscribed(true);
    }
  }

  function addHighQualityMode() {
    const highQuality = {
      icon: 'SunHigh' as IconType,
      toggled: !highQualityRender,
      description:
        'Toggle improved fidelity rendering. Note that this might affect performance',
      onClick: () => {
        setHighQualityRender(!highQualityRender);
        if (highQualityRender) {
          viewer.pointCloudBudget = {
            numberOfPoints:
              3 * defaultsRenderQualityConfig.pointCloudBudget.numberOfPoints,
          };
          viewer.cadBudget = {
            maximumRenderCost:
              3 * defaultsRenderQualityConfig.cadBudget.maximumRenderCost,
            highDetailProximityThreshold:
              defaultsRenderQualityConfig.cadBudget
                .highDetailProximityThreshold,
          };
          viewer.setResolutionOptions({ maxRenderResolution: Infinity });
        } else {
          viewer.pointCloudBudget = {
            ...defaultsRenderQualityConfig.pointCloudBudget,
          };
          viewer.cadBudget = { ...defaultsRenderQualityConfig.cadBudget };
          viewer.setResolutionOptions({
            ...defaultsRenderQualityConfig.resolutionOptions,
          });
        }
      },
    };

    buttonGroups[0].push(highQuality);
  }
}
