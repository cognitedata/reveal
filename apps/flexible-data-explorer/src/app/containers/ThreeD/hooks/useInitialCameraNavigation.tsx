import { useCallback, useEffect, useRef } from 'react';

import {
  useCameraNavigation,
  useGetCameraStateFromUrlParam,
  useReveal,
} from '@cognite/reveal-react-components';

type CameraNavigationActions = {
  loadInitialCameraState: () => void;
  focusInstance: () => void;
};

export const useInitialCameraNavigation = (
  isInitialLoad: boolean,
  instance?: { externalId: string; space: string }
): CameraNavigationActions => {
  const viewer = useReveal();
  const cameraIsMovingRef = useRef(false);
  const getCameraState = useGetCameraStateFromUrlParam();
  const cameraNavigation = useCameraNavigation();

  useEffect(() => {
    const setCameraMoving = () => (cameraIsMovingRef.current = true);
    const setCameraNotMoving = () => (cameraIsMovingRef.current = false);
    viewer.cameraManager.on('cameraChange', setCameraMoving);
    viewer.cameraManager.on('cameraStop', setCameraNotMoving);

    return () => {
      viewer.cameraManager.off('cameraChange', setCameraMoving);
      viewer.cameraManager.off('cameraStop', setCameraNotMoving);
    };
  }, [viewer.cameraManager]);

  const currentCameraState = getCameraState();

  useEffect(() => {
    if (currentCameraState === undefined || cameraIsMovingRef.current) {
      return;
    }

    cameraNavigation.fitCameraToState(currentCameraState);
  }, [currentCameraState, cameraNavigation]);

  const loadInitialCameraState = useCallback(() => {
    if (currentCameraState !== undefined) {
      return;
    }

    if (isInitialLoad && instance === undefined) {
      return cameraNavigation.fitCameraToAllModels();
    }

    if (instance !== undefined) {
      return cameraNavigation.fitCameraToInstance(
        instance.externalId,
        instance.space
      );
    }
  }, [
    cameraNavigation,
    currentCameraState,
    instance?.externalId,
    instance?.space,
    isInitialLoad,
  ]);

  const focusInstance = useCallback(() => {
    if (instance !== undefined) {
      return cameraNavigation.fitCameraToInstance(
        instance.externalId,
        instance.space
      );
    }
  }, [cameraNavigation, instance?.externalId, instance?.space]);

  return {
    focusInstance,
    loadInitialCameraState,
  };
};
