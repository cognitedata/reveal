/*!
 * Copyright 2023 Cognite AS
 */

import { type MutableRefObject, useEffect, useRef } from 'react';
import { useReveal } from '../ViewerContext';
import { type CameraState } from '@cognite/reveal';
import { Vector3 } from 'three';

// keep only rotation and direction as optional
export type CameraStateParameters = Omit<CameraState, 'position' | 'target'> & { position: Vector3; target: Vector3 };

export const useCameraStateControl = (
  externalCameraState?: CameraStateParameters,
  setCameraState?: (cameraState?: CameraStateParameters) => void
): void => {
  const lastSetExternalState = useRef<CameraStateParameters | undefined>(
    externalCameraState === undefined
      ? undefined
      : {
          position: externalCameraState.position.clone(),
          target: externalCameraState.target.clone(),
          rotation: externalCameraState.rotation?.clone(),
          direction: externalCameraState.direction?.clone()
        }
  );

  useSetInternalCameraStateOnExternalUpdate(externalCameraState, lastSetExternalState);

  useSetExternalCameraStateOnCameraMove(setCameraState, externalCameraState, lastSetExternalState);
};

const useSetInternalCameraStateOnExternalUpdate = (
  externalCameraState: CameraStateParameters | undefined,
  lastSetExternalState: MutableRefObject<CameraStateParameters | undefined>
): void => {
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
): void => {
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
        target: currentCameraManagerState.target.clone(),
        rotation: currentCameraManagerState.rotation?.clone(),
        direction: currentCameraManagerState.direction?.clone()
      };

      setCameraState?.(currentCameraManagerState);
    };

    reveal.cameraManager.on('cameraStop', updateStateOnCameraStop);
    return () => {
      reveal.cameraManager.off('cameraStop', updateStateOnCameraStop);
    };
  }, [externalCameraState, setCameraState, lastSetExternalState]);
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
  const { position: previousPosition, target: previousTarget, direction: previousDirection } = previous;
  const { position: currentPosition, target: currentTarget, direction: currentDirection } = current;

  const isPositionStateEqual = previousPosition.distanceToSquared(currentPosition) <= epsilon
  const isTargetStateEqual = previousTarget.distanceToSquared(currentTarget) <= epsilon;
  const isDirectionStateEqual = currentDirection && previousDirection ? previousDirection.distanceToSquared(currentDirection) <= epsilon : true;

  return (
    isPositionStateEqual &&
    isTargetStateEqual &&
    isDirectionStateEqual
  );
}
