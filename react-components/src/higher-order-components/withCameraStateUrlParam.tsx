/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, type ReactElement, type FunctionComponent } from 'react';
import { useReveal } from '..';
import { Vector3 } from 'three';
import { type CameraState } from '@cognite/reveal';

type CameraStateTransform = Omit<Required<CameraState>, 'rotation'>;

export function withCameraStateUrlParam<T extends object>(
  Component: FunctionComponent<T>
): FunctionComponent<T> {
  return function CameraStateUrlParam(props: T): ReactElement {
    const reveal = useReveal();
    const getCameraStateFromUrlParam = useGetCameraStateFromUrlParam();

    const setUrlParamOnCameraStop = (): void => {
      const currentUrlCameraState = getCameraStateFromUrlParam();
      const currentCameraManagerState = reveal.cameraManager.getCameraState();
      if (
        currentUrlCameraState !== undefined &&
        !hasCameraStateChanged(currentUrlCameraState, currentCameraManagerState)
      ) {
        return;
      }
      const { position, target } = currentCameraManagerState;
      const url = new URL(window.location.toString());
      url.searchParams.set('cameraPosition', `[${position.x},${position.y},${position.z}]`);
      url.searchParams.set('cameraTarget', `[${target.x},${target.y},${target.z}]`);
      window.history.replaceState({}, '', url);
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
    previous: CameraStateTransform,
    current: CameraStateTransform
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

export function useGetCameraStateFromUrlParam(): () => CameraStateTransform | undefined {
  return () => {
    const url = new URL(window.location.toString());
    const position = url.searchParams.get('cameraPosition');
    const target = url.searchParams.get('cameraTarget');

    if (position === null || target === null) {
      return;
    }

    const parsedPosition = getParsedVector(position);
    const parsedTarget = getParsedVector(target);

    if (parsedPosition === undefined || parsedTarget === undefined) {
      return;
    }

    return { position: parsedPosition, target: parsedTarget };
  };

  function getParsedVector(s: string): Vector3 | undefined {
    try {
      return new Vector3().fromArray(JSON.parse(s) as [number, number, number]);
    } catch (e) {
      return undefined;
    }
  }
}
