import { useMemo, useContext } from 'react';
import {
  type UseSceneContainerViewModelProps,
  type UseSceneContainerViewModelResult
} from './types';
import { SceneContainerViewModelContext } from './SceneContainer.viewmodel.context';

export function useSceneContainerViewModel({
  sceneExternalId,
  sceneSpaceId
}: UseSceneContainerViewModelProps): UseSceneContainerViewModelResult {
  const {
    useReveal3dResourcesFromScene,
    useGroundPlaneFromScene,
    useSkyboxFromScene,
    useLoadPoisForScene
  } = useContext(SceneContainerViewModelContext);

  const resourceOptions = useReveal3dResourcesFromScene(sceneExternalId, sceneSpaceId);

  useGroundPlaneFromScene(sceneExternalId, sceneSpaceId);
  useSkyboxFromScene(sceneExternalId, sceneSpaceId);
  useLoadPoisForScene(sceneExternalId, sceneSpaceId);

  const hasResources = useMemo(() => resourceOptions.length > 0, [resourceOptions]);

  return {
    resourceOptions,
    hasResources
  };
}
