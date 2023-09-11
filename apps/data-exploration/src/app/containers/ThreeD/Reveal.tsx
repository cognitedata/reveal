import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import styled from 'styled-components';

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

import { useTranslation } from '@data-exploration-lib/core';

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
  setEntered360ImageCollection?: (
    collection: Image360Collection | undefined
  ) => void;
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
  setEntered360ImageCollection,
  onViewerClick,
}: Props) {
  const { t } = useTranslation();
  const {
    setViewState,
    viewer,
    setCadModel,
    setPointCloudModel,
    setImage360,
    secondaryObjectsVisibilityState,
  } = useContext(ThreeDContext);

  const numOfClicks = useRef<number>(0);
  const clickTimer = useRef<NodeJS.Timeout>();

  const [models, setModels] = useState<{
    threeDModel?: CogniteCadModel;
    pointCloudModel?: CognitePointCloudModel;
    imageCollection?: Image360Collection;
  }>();
  const [modelError, setModelError] = useState<{ message: string }>();

  const revealContainerRef = useRef<HTMLDivElement>(null);
  const hasCameraInitialised = useRef<boolean>(false);

  const {
    data: apiThreeDModel,
    isFetched: isModelFetched,
    isError: isModelError,
  } = use3DModel(modelId);

  useEffect(() => {
    if (!revealContainerRef.current || !viewer) {
      return;
    }

    revealContainerRef.current.appendChild(viewer.domElement);
  }, [viewer]);

  useEffect(() => {
    if (!viewer) return;

    let lastUpdatedTime = Date.now();

    const updateCameraState = (position: Vector3, target: Vector3) => {
      const currentTime = Date.now();

      if (!hasCameraInitialised.current || currentTime - lastUpdatedTime < 250)
        return;

      setViewState({ camera: { position, target } });
      lastUpdatedTime = currentTime;
    };

    viewer.on('cameraChange', updateCameraState);

    return () => viewer.off('cameraChange', updateCameraState);
  }, [setViewState, viewer]);

  useEffect(() => {
    const loadModel = async () => {
      if (!viewer) {
        return Promise.reject(new Error('Viewer missing'));
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
          return Promise.reject(
            new Error(
              'The selected 3D model is not supported and can not be loaded. If the 3D model is very old, try uploading a new revision under Upload 3D models in Fusion.'
            )
          );
        }
      }

      if (initialViewerState) {
        const position = initialViewerState.camera?.position ?? {
          x: 0,
          y: 0,
          z: 0,
        };
        const target = initialViewerState.camera?.target ?? {
          x: 0,
          y: 0,
          z: 0,
        };

        viewer.cameraManager.setCameraState({
          position: new Vector3(position.x, position.y, position.z),
          target: new Vector3(target.x, target.y, target.z),
        });
        lastCameraPositionVec.set(position.x, position.y, position.z);
      } else {
        if (model) viewer.loadCameraFromModel(model);
      }

      hasCameraInitialised.current = true;

      let imageCollection: Image360Collection | undefined = undefined;
      if (image360SiteId) {
        try {
          imageCollection = await viewer.add360ImageSet(
            'events',
            {
              site_id: image360SiteId,
            },
            { preMultipliedRotation: false }
          );
        } catch {
          return Promise.reject(
            new Error('The selected 360 image set is not supported')
          );
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
          setEntered360ImageCollection?.(imageCollection);
        });
        imageCollection.on('image360Exited', () => {
          setImage360Entity?.(undefined);
          setEntered360ImageCollection?.(undefined);
        });
      }

      const threeDModel = model instanceof CogniteCadModel ? model : undefined;
      const pointCloudModel =
        model instanceof CognitePointCloudModel ? model : undefined;

      setCadModel(threeDModel);
      setPointCloudModel(pointCloudModel);
      setImage360(imageCollection);

      return { threeDModel, pointCloudModel, imageCollection };
    };

    const modelsPromise = loadModel();

    modelsPromise.then(setModels, (reason: Error) =>
      setModelError({ message: reason.message })
    );

    return () => {
      if (!viewer) return;

      modelsPromise.then((results) => {
        const model3d = results?.threeDModel ?? results?.pointCloudModel;

        if (
          viewer.models.find(
            (model) =>
              model3d?.modelId === model.modelId &&
              model3d?.revisionId === model.revisionId
          ) &&
          model3d
        ) {
          viewer.removeModel(model3d);
        }
        if (
          results?.imageCollection &&
          viewer
            .get360ImageCollections()
            .find(
              (imageCollection) =>
                imageCollection.id === results.imageCollection?.id
            )
        ) {
          viewer.remove360ImageSet(results.imageCollection);
        }
      });
    };
  }, [
    viewer,
    modelId,
    revisionId,
    image360SiteId,
    initialViewerState,
    setCadModel,
    setImage360,
    setImage360Entity,
    setPointCloudModel,
    setEntered360ImageCollection,
  ]);

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

    viewer
      .get360ImageCollections()
      .forEach((image360) =>
        image360.setIconsVisibility(
          secondaryObjectsVisibilityState?.images360 ?? true
        )
      );

    viewer.requestRedraw();
  }, [secondaryObjectsVisibilityState, viewer]);

  useEffect(() => {
    if (modelError) {
      toast.error(<RevealErrorToast error={modelError} t={t} />, {
        toastId: 'reveal-model-load-error',
      });
    }
  }, [modelError, t]);

  const threeDModel = models?.threeDModel;
  const imageCollection = models?.imageCollection;

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
    <RevealContainerDiv ref={revealContainerRef}>
      {children &&
        viewer &&
        models &&
        children({
          pointCloudModel: models.pointCloudModel,
          threeDModel: models.threeDModel,
          viewer,
        })}
    </RevealContainerDiv>
  );
}

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

const RevealContainerDiv = styled.div`
  position: relative;
  height: 100%;
  flex: 1;
`;
