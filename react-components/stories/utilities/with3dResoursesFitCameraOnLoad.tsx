import { type ReactElement, useCallback } from 'react';

import { useCameraNavigation, Reveal3DResources, type Reveal3DResourcesProps } from '../../src';

type RevealResources = typeof Reveal3DResources;

export function with3dResourcesFitCameraOnLoad(Component: RevealResources): RevealResources {
  return function SuppressRevealEvents(props: Reveal3DResourcesProps): ReactElement {
    const cameraNavigation = useCameraNavigation();

    const onResourcesAdded = useCallback(() => {
      cameraNavigation.fitCameraToAllModels();
      props.onResourcesAdded?.();
    }, []);

    return <Component {...props} onResourcesAdded={onResourcesAdded} />;
  };
}

export const RevealResourcesFitCameraOnLoad = with3dResourcesFitCameraOnLoad(Reveal3DResources);
