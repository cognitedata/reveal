import { Vector3 } from 'three';
import { CameraStateParameters } from '../../src';

export function useGetCameraStateFromUrlParam(): () => CameraStateParameters | undefined {
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
