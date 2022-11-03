import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSDK } from '@cognite/sdk-provider';
import styled from 'styled-components';
import { use3DModel } from './hooks';
import {
  CadIntersection,
  Cognite3DModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  DefaultCameraManager,
  ViewerState,
} from '@cognite/reveal';

import { Alert } from 'antd';
import { useQuery, useQueryClient } from 'react-query';
import {
  findClosestAsset,
  highlightAsset,
  fitCameraToAsset,
  removeAllStyles,
  ghostAsset,
} from './utils';
import { ErrorBoundary } from 'react-error-boundary';
import RevealErrorFeedback from './RevealErrorFeedback';
import { PointerEventDelegate } from '@cognite/reveal';
import { usePrevious } from '@cognite/data-exploration';
import { useViewerDoubleClickListener } from './hooks/useViewerDoubleClickListener';
import { StyledSplitter } from 'app/containers/elements';
import { AssetPreviewSidebar } from 'app/containers/ThreeD/AssetPreviewSidebar';

type ChildProps = {
  threeDModel?: Cognite3DModel;
  pointCloudModel?: CognitePointCloudModel;
  viewer: Cognite3DViewer;
};
type Props = {
  modelId: number;
  revisionId: number;

  setSelectedAssetId: Dispatch<SetStateAction<number | undefined>>;
  nodesSelectable: boolean;
  children?: (opts: ChildProps) => JSX.Element;
  assetColumnVisible: boolean;
  initialViewerState?: ViewerState;
  selectedAsset?: number;
  onAssetColumnClose?: () => void;
};

export function Reveal({
  modelId,
  revisionId,
  setSelectedAssetId,
  nodesSelectable,
  children,
  assetColumnVisible,
  initialViewerState,
  selectedAsset,
  onAssetColumnClose,
}: Props) {
  const numOfClicks = useRef<number>(0);
  const clickTimer = useRef<NodeJS.Timeout>();
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const [revealContainer, setRevealContainer] = useState<HTMLDivElement | null>(
    null
  );

  const handleMount = useCallback(
    (node: HTMLDivElement | null) => setRevealContainer(node),
    []
  );

  const {
    data: apiThreeDModel,
    isFetched: isModelFetched,
    isError: isModelError,
  } = use3DModel(modelId);

  const viewer = useMemo(() => {
    if (!revealContainer) {
      return;
    }

    return new Cognite3DViewer({
      sdk,
      domElement: revealContainer!,
      continuousModelStreaming: true,
      loadingIndicatorStyle: {
        placement: 'bottomRight',
        opacity: 1,
      },
    });
  }, [revealContainer, sdk]);

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
      if (initialViewerState) {
        viewer.setViewState(initialViewerState);
      }
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

  const { threeDModel, pointCloudModel } = models || {
    threeDModel: undefined,
    pointCloudModel: undefined,
  };

  useEffect(() => () => viewer?.dispose(), [viewer]);

  useEffect(() => {
    if (!viewer) {
      return;
    }
    const cameraManager = viewer.cameraManager as DefaultCameraManager;
    cameraManager.setCameraControlsOptions({
      mouseWheelAction: selectedAsset ? 'zoomToTarget' : 'zoomToCursor',
    });
  }, [selectedAsset, viewer]);

  useEffect(() => {
    if (!viewer || !threeDModel) {
      return;
    }

    if (
      selectedAsset &&
      !initialViewerState?.models?.some(({ styledSets }) => !!styledSets.length)
    ) {
      if (assetColumnVisible) {
        ghostAsset(sdk, threeDModel, selectedAsset);
      } else {
        highlightAsset(sdk, threeDModel, selectedAsset);
      }
      fitCameraToAsset(
        sdk,
        queryClient,
        viewer,
        threeDModel,
        modelId,
        revisionId,
        selectedAsset
      );
    }
  }, [
    assetColumnVisible,
    initialViewerState?.models,
    modelId,
    queryClient,
    revisionId,
    sdk,
    selectedAsset,
    threeDModel,
    viewer,
  ]);

  const onViewerClick: PointerEventDelegate = useCallback(
    async ({ offsetX, offsetY }) => {
      if (!threeDModel || !viewer || !nodesSelectable) {
        return;
      }
      numOfClicks.current++;
      if (numOfClicks.current === 1) {
        clickTimer.current = setTimeout(async () => {
          const intersection = await viewer.getIntersectionFromPixel(
            offsetX,
            offsetY
          );

          let closestAssetId: number | undefined;
          if (intersection) {
            closestAssetId = await findClosestAsset(
              sdk,
              queryClient,
              threeDModel,
              modelId,
              revisionId,
              intersection as CadIntersection
            );
          }

          if (closestAssetId && closestAssetId !== selectedAsset) {
            highlightAsset(sdk, threeDModel, closestAssetId);
            fitCameraToAsset(
              sdk,
              queryClient,
              viewer,
              threeDModel,
              modelId,
              revisionId,
              closestAssetId
            );
          } else if (!closestAssetId) {
            removeAllStyles(threeDModel);
          }

          setSelectedAssetId(closestAssetId);
          clearTimeout(clickTimer.current);
          numOfClicks.current = 0;
        }, 250);
      }
      if (numOfClicks.current === 2) {
        // it is the second click in double-click event
        clearTimeout(clickTimer.current);
        numOfClicks.current = 0;
      }
    },
    [
      selectedAsset,
      modelId,
      nodesSelectable,
      queryClient,
      revisionId,
      sdk,
      setSelectedAssetId,
      threeDModel,
      viewer,
    ]
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

  useViewerDoubleClickListener({
    viewer: viewer!,
    model: threeDModel!,
    nodesSelectable: nodesSelectable,
  });

  if (isModelError || (isModelFetched && !apiThreeDModel) || !revisionId) {
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
    <StyledSplitter>
      <>
        <RevealContainer id="revealContainer" ref={handleMount} />
        {children &&
          viewer &&
          children({
            threeDModel,
            pointCloudModel,
            viewer,
          })}
      </>
      {!!selectedAsset && threeDModel && assetColumnVisible && (
        <AssetPreviewSidebar
          assetId={selectedAsset}
          onClose={() => {
            removeAllStyles(threeDModel);
            if (onAssetColumnClose) {
              onAssetColumnClose();
            }
          }}
        />
      )}
    </StyledSplitter>
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
