/*!
 * Copyright 2023 Cognite AS
 */

import { type MutableRefObject, useEffect, useRef } from 'react';
import { useReveal } from '../ViewerContext';
import { type CameraState } from '@cognite/reveal';

export type CameraStateParameters = Omit<Required<CameraState>, 'rotation'>;

export const useCameraStateControl = (
  externalCameraState?: CameraStateParameters,
  setCameraState?: (cameraState?: CameraStateParameters) => void
): void => {
  console.log('Camera state control called with external cam state', externalCameraState);

  const initialExternalCameraState = useRef(externalCameraState);

  const lastSetExternalState = useRef<CameraStateParameters | undefined>(
    externalCameraState === undefined
      ? undefined
      : {
          position: externalCameraState.position.clone(),
          target: externalCameraState.target.clone()
        }
  );

  useSetInternalCameraStateOnExternalUpdate(externalCameraState, lastSetExternalState);

  useSetExternalCameraStateOnCameraMove(
    setCameraState,
    externalCameraState,
    initialExternalCameraState,
    lastSetExternalState
  );
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
    console.log('Setting internal state to external: ', externalCameraState);

    reveal.cameraManager.setCameraState(externalCameraState);
  }, [externalCameraState]);
};

const useSetExternalCameraStateOnCameraMove = (
  setCameraState: ((cameraState?: CameraStateParameters) => void) | undefined,
  externalCameraState: CameraStateParameters | undefined,
  initialExternalCameraState: MutableRefObject<CameraStateParameters | undefined>,
  lastSetExternalState: MutableRefObject<CameraStateParameters | undefined>
): void => {
  const reveal = useReveal();
  useEffect(() => {
    const updateStateOnCameraStop = (): void => {
      if (initialExternalCameraState.current !== undefined) {
        reveal.cameraManager.setCameraState(initialExternalCameraState.current);
        initialExternalCameraState.current = undefined;
        console.log('Set with initial camera state');
        return;
      }

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

      console.log('Setting external camera state: ', currentCameraManagerState);

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
  const { position: previousPosition, target: previousTarget } = previous;
  const { position: currentPosition, target: currentTarget } = current;
  return (
    previousPosition.distanceToSquared(currentPosition) <= epsilon &&
    previousTarget.distanceToSquared(currentTarget) <= epsilon
  );
}
