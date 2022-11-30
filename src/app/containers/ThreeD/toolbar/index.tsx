import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@cognite/cogs.js';
import {
  Cognite3DViewer,
  Cognite3DModel,
  CognitePointCloudModel,
} from '@cognite/reveal';
import { createLink } from '@cognite/cdf-utilities';
import { trackUsage } from 'app/utils/Metrics';
import { MeasurementTool } from '@cognite/reveal/tools';
import { useSDK } from '@cognite/sdk-provider';
import { useQueryClient } from 'react-query';
import {
  distancesInFeetAndMeters,
  fitCameraToAsset,
} from 'app/containers/ThreeD/utils';
import { EXPLORATION } from 'app/constants/metrics';

export { default as HelpButton } from './help-button';
export { default as ShareButton } from './share-button';

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <Tooltip content="All 3D models" placement="right">
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
  model,
}: {
  viewer: Cognite3DViewer;
  model?: Cognite3DModel | CognitePointCloudModel;
}) => {
  if (!model) {
    return <></>;
  }

  return (
    <Tooltip content="Fit view" placement="right">
      <Button
        icon="ExpandAlternative"
        aria-label="Fit to view"
        onClick={() => {
          const boundingBox = model.getModelBoundingBox(undefined, true);
          viewer.fitCameraToBoundingBox(boundingBox);
          trackUsage('Exploration.Preview.FitToView');
        }}
        type="ghost"
      />
    </Tooltip>
  );
};

export const FocusAssetButton = ({
  selectedAssetId,
  viewer,
  threeDModel,
}: {
  selectedAssetId?: number;
  viewer: Cognite3DViewer;
  threeDModel?: Cognite3DModel;
}) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  if (!threeDModel || !selectedAssetId) {
    return <></>;
  }

  return (
    <Tooltip content="Fit asset" placement="right">
      <Button
        icon="Collapse"
        onClick={() => {
          if (viewer && threeDModel) {
            fitCameraToAsset(
              sdk,
              queryClient,
              viewer,
              threeDModel,
              selectedAssetId
            );
          }
        }}
        type="ghost"
        aria-label="fit-asset-button"
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
    return new MeasurementTool(viewer, {
      distanceToLabelCallback: (distanceInMeters: number) => {
        return distancesInFeetAndMeters(distanceInMeters);
      },
    });
  }, [viewer]);

  const enterMeasurementMode = () => {
    viewer.domElement.style.cursor = 'crosshair';
    measurementTool.enterMeasurementMode();
    measurementTool.visible(true);
    setNodesSelectable(false);
  };

  const exitMeasurementMode = () => {
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
    trackUsage(EXPLORATION.CLICK.MEASURING_TOOL, { show: nodesSelectable });
  };

  return (
    <Tooltip content="Distance measuring tool" placement="right">
      <Button
        icon="Ruler"
        onClick={handleClick}
        toggled={!nodesSelectable}
        type="ghost"
        aria-label="measurement-button"
      />
    </Tooltip>
  );
};
