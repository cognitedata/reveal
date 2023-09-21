import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useQueryClient } from '@tanstack/react-query';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import {
  Cognite3DViewer,
  CogniteCadModel,
  CogniteModel,
  CognitePointCloudModel,
  Image360Collection,
  MeasurementTool,
} from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';

import { useTranslation } from '@data-exploration-lib/core';

import { EXPLORATION } from '../../../constants/metrics';
import { trackUsage } from '../../../utils/Metrics';
import { distancesInFeetAndMeters, fitCameraToAsset } from '../utils';

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
  model?: CogniteCadModel | CognitePointCloudModel;
}) => {
  const { t } = useTranslation();
  if (!model) {
    return <></>;
  }

  return (
    <Tooltip content={t('Fit view', 'Fit view')} placement="right">
      <FullWidthButton
        icon="ExpandAlternative"
        aria-label="Fit to view"
        onClick={() => {
          const boundingBox = model.getModelBoundingBox(undefined, true);
          viewer.fitCameraToBoundingBox(boundingBox);
          trackUsage(EXPLORATION.THREED_SELECT.FIT_TO_VIEW, {
            resourceType: '3D',
          });
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
  threeDModel?: CogniteCadModel | Image360Collection;
}) => {
  const { t } = useTranslation();
  const sdk = useSDK();
  const queryClient = useQueryClient();

  if (!threeDModel || !selectedAssetId) {
    return <></>;
  }

  return (
    <Tooltip content={t('FIT_ASSET', 'Fit asset')} placement="right">
      <FullWidthButton
        icon="Collapse"
        onClick={() => {
          if (viewer && threeDModel) {
            fitCameraToAsset(
              sdk,
              queryClient,
              viewer,
              { model: threeDModel },
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
  model,
  nodesSelectable,
  setNodesSelectable,
}: {
  viewer: Cognite3DViewer;
  model?: CogniteModel;
  nodesSelectable: boolean;
  setNodesSelectable: (selectable: boolean) => void;
}) => {
  const { t } = useTranslation();

  const measurementTool = useMemo(() => {
    return new MeasurementTool(viewer, {
      distanceToLabelCallback: (distanceInMeters: number) => {
        return distancesInFeetAndMeters(distanceInMeters);
      },
    });
  }, [viewer]);

  if (!model) return <></>;

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
    trackUsage(EXPLORATION.THREED_SELECT.MEASURING_TOOL, {
      show: nodesSelectable,
      resourceType: '3D',
    });
  };

  return (
    <Tooltip
      content={t('DISTANCE_MEASURING_TOOL', 'Distance measuring tool')}
      placement="right"
    >
      <FullWidthButton
        icon="Ruler"
        onClick={handleClick}
        toggled={!nodesSelectable}
        type="ghost"
        aria-label="measurement-button"
      />
    </Tooltip>
  );
};

const FullWidthButton = styled(Button)`
  width: 100%;
`;
