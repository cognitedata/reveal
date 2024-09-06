/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, type ReactElement, type FunctionComponent } from 'react';
import { useReveal } from '..';
import { type CameraState } from '@cognite/reveal';

export type CameraStateParameters = Omit<Required<CameraState>, 'rotation'>;
export type CameraStateProps = {
  cameraState: CameraStateParameters | undefined;
  setCameraState: (value: CameraStateParameters | undefined) => void;
};

export function withCameraStateControl<T extends object>(
  Component: FunctionComponent<T>
): FunctionComponent<T & CameraStateProps> {
  return function CameraStateUrlParam(props: T & CameraStateProps): ReactElement {
    const reveal = useReveal();
    const externalCameraState = props.cameraState;

    const setUrlParamOnCameraStop = (): void => {
      const currentCameraManagerState = reveal.cameraManager.getCameraState();
      if (
        externalCameraState !== undefined &&
        !hasCameraStateChanged(externalCameraState, currentCameraManagerState)
      ) {
        return;
      }

      props.setCameraState(currentCameraManagerState);
    };

    useEffect(() => {
      reveal.cameraManager.on('cameraStop', setUrlParamOnCameraStop);
      return () => {
        reveal.cameraManager.off('cameraStop', setUrlParamOnCameraStop);
      };
    }, []);

    return <Component {...props} />;
  };

  function hasCameraStateChanged(
    previous: CameraStateParameters,
    current: CameraStateParameters
  ): boolean {
    const epsilon = 0.001;
    const { position: previousPosition, target: previousTarget } = previous;
    const { position: currentPosition, target: currentTarget } = current;
    return (
      previousPosition.distanceToSquared(currentPosition) > epsilon ||
      previousTarget.distanceToSquared(currentTarget) > epsilon
    );
  }
}
