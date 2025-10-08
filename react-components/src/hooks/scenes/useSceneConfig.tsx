import { useContext, useMemo } from 'react';
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

export function useSceneConfig(sceneExternalId?: string, sceneSpace?: string): Scene | undefined {
  const { use3dScenes } = useContext(UseSceneConfigContext);
  const allScenes = use3dScenes();

  return useMemo(() => {
    if (sceneExternalId === undefined || sceneSpace === undefined || allScenes.data === undefined) {
      return undefined;
    }

    const sceneData = allScenes.data[sceneSpace]?.[sceneExternalId];
    return transformSceneDataToScene(sceneData);
  }, [sceneExternalId, sceneSpace, allScenes.data]);
}

function transformSceneDataToScene(sceneData: SceneData): Scene {
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
