import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import styled from 'styled-components';
import { use3DModel } from './hooks';
import {
  AssetNodeCollection,
  CadIntersection,
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  DefaultCameraManager,
  DefaultNodeAppearance,
  NodeOutlineColor,
  THREE,
} from '@cognite/reveal';

import { Alert } from 'antd';
import { useQuery } from 'react-query';
import { getAssetMappingsByAssetId } from './utils';
import { ErrorBoundary } from 'react-error-boundary';
import RevealErrorFeedback from './RevealErrorFeedback';
import { PointerEventData } from '@cognite/reveal/packages/utilities';
import { usePrevious } from '@cognite/data-exploration';

type ChildProps = {
  threeDModel?: Cognite3DModel;
  pointCloudModel?: CognitePointCloudModel;
  viewer: Cognite3DViewer;
  boundingBox?: THREE.Box3;
};
type Props = {
  modelId: number;
  revisionId: number;
  focusAssetId?: number | null;
  setSelectedAssetId?: (assetId: number | null) => void;
  children?: (opts: ChildProps) => JSX.Element;
};

export function Reveal({
  focusAssetId,
  modelId,
  revisionId,
  setSelectedAssetId,
  children,
}: Props) {
  const sdk = useSDK();
  const [revealContainer, setRevealContainer] = useState<HTMLDivElement | null>(
    null
  );

  const handleMount = useCallback(
    (node: HTMLDivElement | null) => setRevealContainer(node),
    []
  );

  const { data: apiThreeDModel } = use3DModel(modelId);

  const viewer = useMemo(() => {
    if (!revealContainer) {
      return;
    }

    return new Cognite3DViewer({
      sdk,
      domElement: revealContainer!,
      continuousModelStreaming: true,
      loadingIndicatorStyle: {
        placement: 'topRight',
        opacity: 1,
      },
    });
  }, [revealContainer, sdk]);

  useEffect(() => {
    if (!viewer) {
      return;
    }
    const cameraManager = viewer.cameraManager as DefaultCameraManager;
    cameraManager.setCameraControlsOptions({
      mouseWheelAction: focusAssetId ? 'zoomToTarget' : 'zoomToCursor',
    });
  }, [focusAssetId, viewer]);

  useEffect(() => () => viewer?.dispose(), [viewer]);
  const { data: models } = useQuery(
    ['reveal-model', modelId, revisionId],
    async () => {
      if (!viewer) {
        return Promise.reject('Viewer missing');
      }
      const model = await viewer.addModel({
        modelId: modelId,
        revisionId,
      });

      viewer.loadCameraFromModel(model);
      const threeDModel = model instanceof Cognite3DModel ? model : undefined;
      const pointCloudModel =
        model instanceof CognitePointCloudModel ? model : undefined;

      return { threeDModel, pointCloudModel };
    },
    {
      enabled: !!viewer,
      cacheTime: 0,
    }
  );

  const { data: mappings = [], isFetched: mappingsFetched } = useQuery(
    ['getAssetMappingsByAssetId', modelId, revisionId, focusAssetId],
    () => getAssetMappingsByAssetId(sdk, modelId, revisionId, [focusAssetId!]),
    { enabled: !!focusAssetId }
  );

  const { threeDModel, pointCloudModel } = models || {
    threeDModel: undefined,
    pointCloudModel: undefined,
  };

  const { data: selectedAssetBoundingBox } = useQuery(
    ['reveal-model', modelId, revisionId, focusAssetId],
    async () => {
      const boundingBoxNodes = await Promise.all(
        mappings.map(m => threeDModel?.getBoundingBoxByNodeId(m.nodeId))
      );

      const boundingBox = boundingBoxNodes.reduce((accl: THREE.Box3, box) => {
        return box ? accl.union(box) : accl;
      }, new THREE.Box3());

      return boundingBox;
    },
    {
      enabled: !!threeDModel && mappingsFetched,
    }
  );

  useEffect(() => {
    if (!threeDModel || !viewer) {
      return;
    }

    threeDModel.removeAllStyledNodeCollections();

    if (focusAssetId) {
      const assetNodes = new AssetNodeCollection(sdk, threeDModel);

      assetNodes.executeFilter({ assetId: focusAssetId });

      threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      threeDModel.assignStyledNodeCollection(assetNodes, {
        renderGhosted: false,
        outlineColor: NodeOutlineColor.Cyan,
      });

      if (selectedAssetBoundingBox) {
        viewer.fitCameraToBoundingBox(selectedAssetBoundingBox);
      }
    } else {
      threeDModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
    }
  }, [selectedAssetBoundingBox, focusAssetId, sdk, threeDModel, viewer]);

  const onViewerClick = useCallback(
    async ({ offsetX, offsetY }: PointerEventData) => {
      if (!threeDModel || !viewer || !setSelectedAssetId) {
        return;
      }

      // Click outside selected asset handler
      const intersection = await viewer.getIntersectionFromPixel(
        offsetX,
        offsetY
      );
      if (intersection && focusAssetId) {
        const { treeIndex } = intersection as CadIntersection;

        const node = await threeDModel.mapTreeIndexToNodeId(treeIndex);
        if (!node) {
          setSelectedAssetId(null);
        }
      } else {
        setSelectedAssetId(null);
      }
    },
    [focusAssetId, setSelectedAssetId, threeDModel, viewer]
  );
  const previousClickHandler = usePrevious(onViewerClick);

  useEffect(() => {
    if (!viewer) {
      return;
    }
    if (previousClickHandler) {
      viewer.off('click', previousClickHandler);
    }
    viewer.on('click', onViewerClick);
  }, [onViewerClick, previousClickHandler, viewer]);

  if (!apiThreeDModel || !revisionId) {
    return (
      <Alert
        type="error"
        message="Error"
        description="An error occurred retrieving the resource. Make sure you have access to this resource type."
        style={{ marginTop: '50px' }}
      />
    );
  }

  return (
    <>
      <RevealContainer id="revealContainer" ref={handleMount} />
      {children &&
        viewer &&
        children({
          threeDModel,
          pointCloudModel,
          viewer,
          boundingBox: selectedAssetBoundingBox,
        })}
    </>
  );
}

// This container has an inline style 'position: relative' given by @cognite/reveal.
// We can not cancel it, so we had to use that -85px trick here!
const RevealContainer = styled.div`
  height: 100%;
  width: 100%;
  max-height: 100%;
  max-width: 100%;
`;

export default function RevealWithErrorBoundary(props: Props) {
  return (
    /* This is aparantly an issue because of multiple versions of @types/react. Error fallback
    // seems to work.
    @ts-ignore */
    <ErrorBoundary FallbackComponent={RevealErrorFeedback}>
      <Reveal {...props} />
    </ErrorBoundary>
  );
}
