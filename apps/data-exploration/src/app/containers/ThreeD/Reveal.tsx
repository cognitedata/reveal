import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';
import { Alert } from 'antd';
import { Vector3 } from 'three';

import { toast } from '@cognite/cogs.js';
import { usePrevious } from '@cognite/data-exploration';
import {
  PointerEventDelegate,
  CogniteCadModel,
  Cognite3DViewer,
  CognitePointCloudModel,
  Intersection,
  ViewerState,
  Image360,
  Image360Collection,
  Image360AnnotationIntersection,
} from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';

import { ThreeDContext } from './contexts/ThreeDContext';
import { use3DModel } from './hooks';
import { useViewerDoubleClickListener } from './hooks/useViewerDoubleClickListener';
import RevealErrorFeedback from './RevealErrorFeedback';
import RevealErrorToast from './RevealErrorToast';
import { IMAGE_360_POSITION_THRESHOLD } from './utils';

type ChildProps = {
  threeDModel?: CogniteCadModel;
  pointCloudModel?: CognitePointCloudModel;
  viewer: Cognite3DViewer;
};

type Props = {
  modelId?: number;
  revisionId?: number;
  image360SiteId?: string;
  nodesSelectable: boolean;
  initialViewerState?: ViewerState;
  setImage360Entity?: (entity: Image360 | undefined) => void;
  image360Entities?: { siteId: string; images: Image360Collection }[];
  onViewerClick?: (
    intersection: Intersection | null,
    image360AnnotationIntersection: Image360AnnotationIntersection | null
  ) => void;
  children?: (childProps: ChildProps) => JSX.Element;
};

export function Reveal({
  children,
  modelId,
  revisionId,
  image360SiteId,
  nodesSelectable,
  initialViewerState,
  setImage360Entity,
  onViewerClick,
  image360Entities,
}: Props) {
  const context = useContext(ThreeDContext);
  const {
    setViewer,
    set3DModel,
    setPointCloudModel,
    setImage360,
    secondaryObjectsVisibilityState,
  } = context;
  const numOfClicks = useRef<number>(0);
  const clickTimer = useRef<NodeJS.Timeout>();
  const sdk = useSDK();

  const [image360CollectionSiteId, setImage360CollectionSiteId] = useState<
    string[]
  >([]);

  const revealContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: apiThreeDModel,
    isFetched: isModelFetched,
    isError: isModelError,
  } = use3DModel(modelId);

  const viewer = useMemo(() => {
    if (!revealContainerRef.current) {
      return;
    }

    return new Cognite3DViewer({
      sdk,
      domElement: revealContainerRef.current,
      continuousModelStreaming: true,
      loadingIndicatorStyle: {
        placement: 'topRight',
        opacity: 1,
      },
    });
  }, [sdk, revealContainerRef.current]);

  useEffect(() => {
    setViewer(viewer);
  }, [setViewer, viewer]);

  const { data: models, error } = useQuery(
    ['reveal-model', modelId, revisionId, image360SiteId],
    async () => {
      if (!viewer) {
        return Promise.reject('Viewer missing');
      }
      let model;

      const lastCameraPositionVec = new Vector3();
      const reusableVec = new Vector3();

      if (modelId && revisionId) {
        try {
          model = await viewer.addModel({
            modelId,
            revisionId,
          });
        } catch {
          return Promise.reject({
            message:
              'The selected 3D model is not supported and can not be loaded. If the 3D model is very old, try uploading a new revision under Upload 3D models in Fusion.',
          });
        }

        // Load camera from model when camera state is unavailable
        if (!initialViewerState?.camera) {
          viewer.loadCameraFromModel(model);
        }
      }

      if (initialViewerState) {
        const { x, y, z } = initialViewerState.camera!.position;

        viewer.setViewState(initialViewerState);
        lastCameraPositionVec.set(x, y, z);
      }

      let imageCollection: Image360Collection | undefined = undefined;
      if (
        image360SiteId &&
        !image360CollectionSiteId.includes(image360SiteId)
      ) {
        try {
          imageCollection = await viewer.add360ImageSet(
            'events',
            {
              site_id: image360SiteId,
            },
            { preMultipliedRotation: false }
          );
          image360CollectionSiteId.push(image360SiteId);
          setImage360CollectionSiteId(image360CollectionSiteId);
        } catch {
          return Promise.reject({
            message: 'The selected 360 image set is not supported',
          });
        }

        const currentImage360 = initialViewerState
          ? imageCollection.image360Entities.find(
              ({ transform }) =>
                lastCameraPositionVec.distanceToSquared(
                  reusableVec.setFromMatrixPosition(transform)
                ) < IMAGE_360_POSITION_THRESHOLD
            )
          : imageCollection.image360Entities[0];

        if (currentImage360) {
          viewer.enter360Image(currentImage360);
          viewer.cameraManager.setCameraState({
            position: reusableVec.setFromMatrixPosition(
              currentImage360.transform
            ),
          });
        }

        imageCollection.on('image360Entered', (image360) => {
          setImage360Entity?.(image360);
        });
        imageCollection.on('image360Exited', () => {
          setImage360Entity?.(undefined);
        });
      }

      const threeDModel = model instanceof CogniteCadModel ? model : undefined;
      const pointCloudModel =
        model instanceof CognitePointCloudModel ? model : undefined;

      set3DModel(threeDModel);
      setPointCloudModel(pointCloudModel);
      setImage360(imageCollection);

      return { threeDModel, pointCloudModel, imageCollection };
    },
    {
      enabled: !!viewer,
      cacheTime: 0,
    }
  );

  useEffect(() => {
    if (!viewer) return;

    viewer.models.forEach((model) => {
      if (model instanceof CogniteCadModel) {
        model.visible = secondaryObjectsVisibilityState?.models3d ?? true;
      } else if (model instanceof CognitePointCloudModel) {
        model.setDefaultPointCloudAppearance({
          visible: secondaryObjectsVisibilityState?.models3d ?? true,
        });
      }
    });

    image360Entities?.forEach((image360) =>
      image360.images.setIconsVisibility(
        secondaryObjectsVisibilityState?.images360 ?? true
      )
    );

    viewer.requestRedraw();
  }, [secondaryObjectsVisibilityState, image360Entities, viewer]);

  useEffect(() => {
    if (error) {
      toast.error(<RevealErrorToast error={error as { message?: string }} />, {
        toastId: 'reveal-model-load-error',
      });
    }
  }, [error]);

  const threeDModel = models?.threeDModel;
  const imageCollection = models?.imageCollection;

  useEffect(() => () => viewer?.dispose(), [viewer]);

  const _onViewerClick: PointerEventDelegate = useCallback(
    async ({ offsetX, offsetY }) => {
      if ((!threeDModel && !imageCollection) || !viewer || !nodesSelectable) {
        return;
      }
      numOfClicks.current++;
      if (numOfClicks.current === 1) {
        clickTimer.current = setTimeout(async () => {
          const image360Intersection =
            await viewer.get360AnnotationIntersectionFromPixel(
              offsetX,
              offsetY
            );
          const intersection = await viewer.getIntersectionFromPixel(
            offsetX,
            offsetY
          );
          if (onViewerClick) {
            onViewerClick(intersection, image360Intersection);
          }

          // In node types package >18, the types for 'clearTimeout' also allows for NodeJS.Timeout.
          // Super strange that they have not already done so initially.
          clearTimeout(clickTimer.current as any);
          numOfClicks.current = 0;
        }, 250);
      }
      if (numOfClicks.current === 2) {
        // it is the second click in double-click event
        clearTimeout(clickTimer.current as any);
        numOfClicks.current = 0;
      }
    },
    [nodesSelectable, onViewerClick, threeDModel, viewer, imageCollection]
  );
  const previousClickHandler = usePrevious(_onViewerClick);

  useEffect(() => {
    if (!viewer) {
      return;
    }
    if (previousClickHandler) {
      viewer.off('click', previousClickHandler);
    }
    viewer.on('click', _onViewerClick);
  }, [_onViewerClick, previousClickHandler, viewer]);

  useViewerDoubleClickListener({
    viewer: viewer,
    nodesSelectable: nodesSelectable,
  });

  if (
    (isModelError || (isModelFetched && !apiThreeDModel) || !revisionId) &&
    !image360SiteId
  ) {
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
      <RevealContainer id="revealContainer" ref={revealContainerRef} />
      {children &&
        viewer &&
        models &&
        children({
          pointCloudModel: models.pointCloudModel,
          threeDModel: models.threeDModel,
          viewer,
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
