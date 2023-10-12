import React, { useContext, useEffect, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import noop from 'lodash/noop';
import * as THREE from 'three';

import { Cognite3DViewer } from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';

import { ThreeDContext } from '../contexts/ThreeDContext';
import { LabelEventHandler, SmartOverlayTool } from '../tools/SmartOverlayTool';
import { getAssetQueryKey } from '../utils';

type OverlayToolProps = {
  viewer: Cognite3DViewer;
  onLabelClick?: LabelEventHandler;
};

const OverlayTool = ({
  viewer,
  onLabelClick,
}: OverlayToolProps): JSX.Element => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const { cadModel, setOverlayTool } = useContext(ThreeDContext);

  const smartOverlayTool = useMemo(() => {
    if (!viewer) return;

    return new SmartOverlayTool(viewer);
  }, [viewer]);

  useEffect(() => {
    setOverlayTool(smartOverlayTool);
  }, [setOverlayTool, smartOverlayTool]);

  useEffect(() => {
    if (!viewer || !cadModel || !smartOverlayTool) {
      return;
    }

    smartOverlayTool.maxPointIndicatorDistance =
      cadModel
        .getModelBoundingBox(undefined, true)
        .getBoundingSphere(new THREE.Sphere()).radius * 0.07;
    smartOverlayTool.visible = false;

    smartOverlayTool.on('hover', async (event) => {
      const label = event.targetLabel;

      const asset = await queryClient.fetchQuery(
        getAssetQueryKey(label.id),
        async () => await sdk.assets.retrieve([{ id: label.id }])
      );
      label.textOverlay.innerText = asset[0]?.name ?? 'undefined';
    });

    smartOverlayTool.on('click', onLabelClick ?? noop);
  }, [cadModel, onLabelClick, smartOverlayTool, sdk, viewer, queryClient]);

  return <></>;
};

export default OverlayTool;
