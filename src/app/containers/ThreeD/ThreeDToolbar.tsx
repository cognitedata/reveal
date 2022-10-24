import React, { useMemo, useState } from 'react';
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
    <Tooltip content="Fit to view">
      <Button
        icon="ExpandAlternative"
        aria-label="Fit to view"
        onClick={() => {
          if (viewer && viewerModel) {
            viewer.fitCameraToModel(viewerModel);
          }
        }}
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
    <Tooltip content="Focus asset">
      <Button
        icon="Collapse"
        onClick={() => {
          if (viewer && viewerModel) {
            viewer.fitCameraToBoundingBox(boundingBox);
          }
        }}
      />
    </Tooltip>
  );
};

export const PointToPointMeasurementButton = ({
  viewer,
}: {
  viewer: Cognite3DViewer;
}) => {
  const measurementTool = useMemo(() => {
    return new MeasurementTool(viewer);
  }, [viewer]);

  const cameraManager = useMemo(() => {
    return viewer.cameraManager as DefaultCameraManager;
  }, [viewer]);

  const [isInMeasurementMode, setIsInMeasurementMode] = useState(false);

  const enterMeasurementMode = () => {
    cameraManager.setCameraControlsOptions({
      ...cameraManager.getCameraControlsOptions(),
      changeCameraTargetOnClick: false,
    });
    viewer.domElement.style.cursor = 'crosshair';
    measurementTool.enterMeasurementMode();
    setIsInMeasurementMode(true);
  };

  const exitMeasurementMode = () => {
    cameraManager.setCameraControlsOptions({
      ...cameraManager.getCameraControlsOptions(),
      changeCameraTargetOnClick: true,
    });
    viewer.domElement.style.cursor = 'default';
    measurementTool.exitMeasurementMode();
    setIsInMeasurementMode(false);
  };

  const handleClick = () => {
    if (isInMeasurementMode) {
      exitMeasurementMode();
    } else {
      enterMeasurementMode();
    }
  };

  return (
    <Tooltip content="Measure distance between two points">
      <Button
        icon="Ruler"
        onClick={handleClick}
        toggled={isInMeasurementMode}
      />
    </Tooltip>
  );
};
