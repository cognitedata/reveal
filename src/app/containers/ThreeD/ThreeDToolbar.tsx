import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@cognite/cogs.js';
import {
  Cognite3DViewer,
  Cognite3DModel,
  CognitePointCloudModel,
  DefaultCameraManager,
} from '@cognite/reveal';
import { createLink } from '@cognite/cdf-utilities';
import { trackUsage } from 'app/utils/Metrics';
import { MeasurementTool } from '@cognite/reveal/tools';
import { useSDK } from '@cognite/sdk-provider';
import { useQueryClient } from 'react-query';
import { fitCameraToAsset } from 'app/containers/ThreeD/utils';

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
  modelId,
  revisionId,
  selectedAssetId,
  viewer,
  threeDModel,
}: {
  modelId: number;
  revisionId: number;
  selectedAssetId?: number;
  viewer: Cognite3DViewer | null;
  threeDModel: Cognite3DModel | null;
}) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  if (!selectedAssetId) {
    return <></>;
  }

  return (
    <Tooltip content="Fit asset">
      <Button
        icon="Collapse"
        onClick={() => {
          if (viewer && threeDModel) {
            fitCameraToAsset(
              sdk,
              queryClient,
              viewer,
              threeDModel,
              modelId,
              revisionId,
              selectedAssetId
            );
          }
        }}
        type="ghost"
      />
    </Tooltip>
  );
};

export const PointToPointMeasurementButton = ({
  viewer,
  nodesSelectable,
  setNodesSelectable,
}: {
  viewer: Cognite3DViewer;
  nodesSelectable: boolean;
  setNodesSelectable: (selectable: boolean) => void;
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
    measurementTool.visible(true);
    setNodesSelectable(false);
  };

  const exitMeasurementMode = () => {
    cameraManager.setCameraControlsOptions({
      ...cameraManager.getCameraControlsOptions(),
      changeCameraTargetOnClick: true,
    });
    viewer.domElement.style.cursor = 'default';
    measurementTool.visible(false);
    measurementTool.exitMeasurementMode();
    setNodesSelectable(true);
  };

  const handleClick = () => {
    if (!nodesSelectable) {
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
        toggled={!nodesSelectable}
        type="ghost"
      />
    </Tooltip>
  );
};
