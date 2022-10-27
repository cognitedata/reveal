import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@cognite/cogs.js';
import {
  Cognite3DViewer,
  Cognite3DModel,
  CognitePointCloudModel,
  THREE,
  DefaultCameraManager,
} from '@cognite/reveal';
import { createLink } from '@cognite/cdf-utilities';
import { trackUsage } from 'app/utils/Metrics';
import { MeasurementTool } from '@cognite/reveal/tools';

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip content="All 3D models">
      <Button
        icon="Home"
        aria-label="Home"
        onClick={() => {
          navigate(createLink(`/explore/search/threeD`));
          trackUsage('Exploration.Preview.ThreeDModel');
        }}
      />
    </Tooltip>
  );
};

export const ExpandButton = ({
  viewer,
  viewerModel,
}: {
  viewer: Cognite3DViewer | null;
  viewerModel: Cognite3DModel | CognitePointCloudModel | null;
}) => {
  return (
    <Tooltip content="Fit view">
      <Button
        icon="ExpandAlternative"
        aria-label="Fit to view"
        onClick={() => {
          if (viewer && viewerModel) {
            viewer.fitCameraToModel(viewerModel);
          }
          trackUsage('Exploration.Preview.FitToView');
        }}
        type="ghost"
      />
    </Tooltip>
  );
};

export const FocusAssetButton = ({
  boundingBox,
  viewer,
  viewerModel,
}: {
  boundingBox?: THREE.Box3;
  viewer: Cognite3DViewer | null;
  viewerModel: Cognite3DModel | null;
}) => {
  if (!boundingBox) {
    return <></>;
  }

  return (
    <Tooltip content="Fit asset">
      <Button
        icon="Collapse"
        onClick={() => {
          if (viewer && viewerModel) {
            viewer.fitCameraToBoundingBox(boundingBox);
          }
        }}
        type="ghost"
      />
    </Tooltip>
  );
};

export const PointToPointMeasurementButton = ({
  viewer,
  nodesClickable,
  setNodesClickable,
}: {
  viewer: Cognite3DViewer;
  nodesClickable: boolean;
  setNodesClickable: (clickable: boolean) => void;
}) => {
  const measurementTool = useMemo(() => {
    return new MeasurementTool(viewer);
  }, [viewer]);

  const cameraManager = useMemo(() => {
    return viewer.cameraManager as DefaultCameraManager;
  }, [viewer]);

  const enterMeasurementMode = () => {
    cameraManager.setCameraControlsOptions({
      ...cameraManager.getCameraControlsOptions(),
      changeCameraTargetOnClick: false,
    });
    viewer.domElement.style.cursor = 'crosshair';
    measurementTool.enterMeasurementMode();
    setNodesClickable(false);
  };

  const exitMeasurementMode = () => {
    cameraManager.setCameraControlsOptions({
      ...cameraManager.getCameraControlsOptions(),
      changeCameraTargetOnClick: true,
    });
    viewer.domElement.style.cursor = 'default';
    measurementTool.exitMeasurementMode();
    setNodesClickable(true);
  };

  const handleClick = () => {
    if (!nodesClickable) {
      exitMeasurementMode();
    } else {
      enterMeasurementMode();
    }
  };

  return (
    <Tooltip content="Distance measuring tool">
      <Button
        icon="Ruler"
        onClick={handleClick}
        toggled={!nodesClickable}
        type="ghost"
      />
    </Tooltip>
  );
};
