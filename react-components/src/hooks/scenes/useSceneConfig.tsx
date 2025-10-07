import { useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type SceneData } from './types';
import {
  type CadOrPointCloudModel,
  type Image360Collection,
  type Scene
} from '../../components/SceneContainer/sceneTypes';
import { UseSceneConfigContext } from './useSceneConfig.context';
import {
  type AddCadResourceOptions,
  type AddPointCloudResourceOptions,
  type AddImage360CollectionDatamodelsOptions,
  isClassicIdentifier
} from '../../components/Reveal3DResources';

export type UseSceneConfigResult = UseQueryResult<Scene | undefined | null>;

export function useSceneConfig(
  sceneExternalId?: string,
  sceneSpace?: string
): UseSceneConfigResult {
  const { use3dScenes } = useContext(UseSceneConfigContext);
  const allScenes = use3dScenes();

  return useQuery({
    queryKey: ['reveal', 'react-components', 'sync-scene-config', sceneExternalId, sceneSpace],
    queryFn: async () => {
      if (
        sceneExternalId === undefined ||
        sceneSpace === undefined ||
        allScenes.data === undefined
      ) {
        return null;
      }

      const sceneData = allScenes.data[sceneSpace]?.[sceneExternalId];
      return transformSceneDataToScene(sceneData);
    },
    enabled:
      sceneExternalId !== undefined && sceneSpace !== undefined && allScenes.data !== undefined,
    staleTime: Infinity
  });
}

function transformSceneDataToScene(sceneData: SceneData | undefined): Scene | null {
  if (sceneData === undefined) {
    return null;
  }

  return {
    sceneConfiguration: {
      name: sceneData.name,
      cameraTranslationX: sceneData.cameraTranslationX,
      cameraTranslationY: sceneData.cameraTranslationY,
      cameraTranslationZ: sceneData.cameraTranslationZ,
      cameraEulerRotationX: sceneData.cameraEulerRotationX,
      cameraEulerRotationY: sceneData.cameraEulerRotationY,
      cameraEulerRotationZ: sceneData.cameraEulerRotationZ,
      cameraTargetX: sceneData.cameraTargetX,
      cameraTargetY: sceneData.cameraTargetY,
      cameraTargetZ: sceneData.cameraTargetZ,
      qualitySettings: sceneData.qualitySettings
    },
    skybox: sceneData.skybox,
    groundPlanes: sceneData.groundPlanes,
    sceneModels: transformModelOptionsToSceneModels(sceneData.modelOptions),
    image360Collections: transformImage360OptionsToCollections(sceneData.image360CollectionOptions)
  };
}
function transformModelOptionsToSceneModels(
  modelOptions: Array<AddCadResourceOptions | AddPointCloudResourceOptions>
): CadOrPointCloudModel[] {
  return modelOptions.map((modelOption) => {
    if (isClassicIdentifier(modelOption)) {
      return {
        modelIdentifier: {
          modelId: modelOption.modelId,
          revisionId: modelOption.revisionId
        },
        defaultVisible: modelOption.defaultVisible,
        transform: modelOption.transform
      };
    } else {
      return {
        modelIdentifier: {
          revisionExternalId: modelOption.revisionExternalId,
          revisionSpace: modelOption.revisionSpace
        },
        defaultVisible: modelOption.defaultVisible,
        transform: modelOption.transform
      };
    }
  });
}

function transformImage360OptionsToCollections(
  image360Options: AddImage360CollectionDatamodelsOptions[]
): Image360Collection[] {
  return image360Options.map((option) => {
    return {
      image360CollectionExternalId: option.externalId,
      image360CollectionSpace: option.space,
      defaultVisible: option.defaultVisible,
      transform: option.transform
    };
  });
}
