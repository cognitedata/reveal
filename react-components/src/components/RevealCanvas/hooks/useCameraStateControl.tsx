/*!
 * Copyright 2023 Cognite AS
 */

import { MutableRefObject, useEffect, useRef } from 'react';
import { useReveal } from '../../..';
import { type CameraState } from '@cognite/reveal';

export type CameraStateParameters = Omit<Required<CameraState>, 'rotation'>;

export const useCameraStateControl = (
  externalCameraState?: CameraStateParameters,
  setCameraState?: (cameraState?: CameraStateParameters) => void
): void => {
  const lastSetExternalState = useRef<CameraStateParameters | undefined>(
    externalCameraState === undefined
      ? undefined
      : {
          position: externalCameraState.position.clone(),
          target: externalCameraState.target.clone()
        }
  );

  useSetInternalCameraStateOnExternalUpdate(externalCameraState, lastSetExternalState);

  useSetExternalCameraStateOnCameraMove(setCameraState, externalCameraState, lastSetExternalState);
};

const useSetInternalCameraStateOnExternalUpdate = (
  externalCameraState: CameraStateParameters | undefined,
  lastSetExternalState: MutableRefObject<CameraStateParameters | undefined>
) => {
  const reveal = useReveal();

  useEffect(() => {
    if (
      externalCameraState === undefined ||
      isCameraStatesEqual(externalCameraState, lastSetExternalState.current)
    ) {
      return;
    }

    reveal.cameraManager.setCameraState(externalCameraState);
  }, [externalCameraState]);
};

const useSetExternalCameraStateOnCameraMove = (
  setCameraState: ((cameraState?: CameraStateParameters) => void) | undefined,
  externalCameraState: CameraStateParameters | undefined,
  lastSetExternalState: MutableRefObject<CameraStateParameters | undefined>
) => {
  const reveal = useReveal();
  useEffect(() => {
    const updateStateOnCameraStop = (): void => {
      const currentCameraManagerState = reveal.cameraManager.getCameraState();
      if (
        externalCameraState !== undefined &&
        isCameraStatesEqual(externalCameraState, currentCameraManagerState)
      ) {
        return;
      }

      lastSetExternalState.current = {
        position: currentCameraManagerState.position.clone(),
        target: currentCameraManagerState.target.clone()
      };

      setCameraState?.(currentCameraManagerState);
    };

    reveal.cameraManager.on('cameraStop', updateStateOnCameraStop);
    return () => {
      reveal.cameraManager.off('cameraStop', updateStateOnCameraStop);
    };
  }, []);
};

function isCameraStatesEqual(
  previous: CameraStateParameters | undefined,
  current: CameraStateParameters | undefined
): boolean {
  if (previous === undefined && current === undefined) {
    return true;
  }

  if (previous === undefined || current === undefined) {
    return false;
  }

  const epsilon = 0.001;
  const { position: previousPosition, target: previousTarget } = previous;
  const { position: currentPosition, target: currentTarget } = current;
  return (
    previousPosition.distanceToSquared(currentPosition) <= epsilon &&
    previousTarget.distanceToSquared(currentTarget) <= epsilon
  );
}
