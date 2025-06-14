import { type MutableRefObject, useEffect, useRef } from 'react';
import { useReveal } from '../ViewerContext';
import { type CameraState } from '@cognite/reveal';
import { Quaternion } from 'three';

// Camera state parameters type with position and target as requires but rotation as optional
export type CameraStateParameters = Omit<Required<CameraState>, 'rotation'> &
  Pick<CameraState, 'rotation'>;

export const useCameraStateControl = (
  externalCameraState?: CameraStateParameters,
  setCameraState?: (cameraState?: CameraStateParameters) => void
): void => {
  const lastSetExternalState = useRef<CameraStateParameters | undefined>(undefined);

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
        rotation: currentCameraManagerState.rotation.clone()
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
  const {
    position: previousPosition,
    target: previousTarget,
    rotation: previousRotation
  } = previous;
  const { position: currentPosition, target: currentTarget, rotation: currentRotation } = current;

  const isPositionStateEqual = previousPosition.distanceToSquared(currentPosition) <= epsilon;
  const isTargetStateEqual = previousTarget.distanceToSquared(currentTarget) <= epsilon;

  const nonNullCurrentRotation = currentRotation ?? new Quaternion().identity();
  const nonNullPreviousRotation = previousRotation ?? new Quaternion().identity();
  const isRotationStateEqual = nonNullPreviousRotation.angleTo(nonNullCurrentRotation) <= epsilon;

  return isPositionStateEqual && isTargetStateEqual && isRotationStateEqual;
}
