/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, type ReactElement, type FunctionComponent } from 'react';
import { useReveal } from '..';
import { Vector3 } from 'three';
import { type CameraState } from '@cognite/reveal';

export function withCameraStateUrlParam<T extends object>(
  Component: FunctionComponent<T>
): FunctionComponent<T> {
  return function CameraStateUrlParam(props: T): ReactElement {
    const reveal = useReveal();

    const setUrlParamOnCameraStop = (): void => {
      const url = new URL(window.location.toString());
      const { position, target } = reveal.cameraManager.getCameraState();
      url.searchParams.set('cameraPosition', `[${position.x},${position.y},${position.z}]`);
      url.searchParams.set('cameraTarget', `[${target.x},${target.y},${target.z}]`);
      window.history.pushState({}, '', url);
    };

    useEffect(() => {
      reveal.cameraManager.on('cameraStop', setUrlParamOnCameraStop);
      return () => {
        reveal.cameraManager.off('cameraStop', setUrlParamOnCameraStop);
      };
    }, []);

    return <Component {...props} />;
  };
}

export function useGetCameraStateFromUrlParam(): () => CameraState | undefined {
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
      return new Vector3().fromArray(JSON.parse(s));
    } catch (e) {
      return undefined;
    }
  }
}
