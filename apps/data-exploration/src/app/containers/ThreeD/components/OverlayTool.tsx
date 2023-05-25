import React, { useContext, useEffect, useMemo } from 'react';

import { Cognite3DViewer } from '@cognite/reveal';
import {
  LabelEventHandler,
  SmartOverlayTool,
} from '@data-exploration-app/containers/ThreeD/tools/SmartOverlayTool';
import { useSDK } from '@cognite/sdk-provider';
import { ThreeDContext } from '@data-exploration-app/containers/ThreeD/ThreeDContext';
import * as THREE from 'three';
import { useQueryClient } from '@tanstack/react-query';
import { getAssetQueryKey } from '@data-exploration-app/containers/ThreeD/utils';
import noop from 'lodash/noop';

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

  const { threeDModel, setOverlayTool } = useContext(ThreeDContext);

  const smartOverlayTool = useMemo(() => {
    if (!viewer) return;

    return new SmartOverlayTool(viewer);
  }, [viewer]);

  useEffect(() => {
    setOverlayTool(smartOverlayTool);
  }, [setOverlayTool, smartOverlayTool]);

  useEffect(() => {
    if (!viewer || !threeDModel || !smartOverlayTool) {
      return;
    }

    smartOverlayTool.maxPointIndicatorDistance =
      threeDModel
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
  }, [threeDModel, onLabelClick, smartOverlayTool, sdk, viewer, queryClient]);

  return <></>;
};

export default OverlayTool;
