import { type ReactNode, useContext, useCallback } from 'react';
import { type SceneContainerProps } from './types';
import { SceneContainerContext } from './SceneContainer.context';

export function SceneContainer({
  sceneExternalId,
  sceneSpaceId,
  onResourcesAdded,
  ...rest
}: SceneContainerProps): ReactNode {
  const { Reveal3DResources, useSceneContainerViewModel } = useContext(SceneContainerContext);
  const { resourceOptions, hasResources, onPointCloudSettingsCallback } =
    useSceneContainerViewModel({
      sceneExternalId,
      sceneSpaceId
    });

  const combinedOnResourcesAdded = useCallback(() => {
    onPointCloudSettingsCallback();
    onResourcesAdded?.();
  }, [onPointCloudSettingsCallback, onResourcesAdded]);

  if (!hasResources) {
    return null;
  }

  return (
    <Reveal3DResources
      resources={resourceOptions}
      onResourcesAdded={combinedOnResourcesAdded}
      {...rest}
    />
  );
}
