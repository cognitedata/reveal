import { useSceneConfig } from './scenes/useSceneConfig';
import { type CogniteClient } from '@cognite/sdk';
import {
  type AddResourceOptions,
  type AddImage360CollectionDatamodelsOptions
} from '../components/Reveal3DResources/types';
import {
  type ClassicDataSourceType,
  type DMDataSourceType,
  type AddModelOptions
} from '@cognite/reveal';
import { useEffect, useState } from 'react';
import {
  isClassicIdentifier,
  isDM3DModelIdentifier
} from '../components/Reveal3DResources/typeGuards';
import { useIsCoreDmOnly } from './useIsCoreDmOnly';

export type UseSyncSceneConfigWithViewerProps = {
  sdk: CogniteClient;
  sceneExternalId: string;
  sceneSpaceId: string;
};

export const useReveal3dResourcesFromScene = (
  sceneExternalId: string,
  sceneSpaceId: string
): AddResourceOptions[] => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const [resourceOptions, setResourceOptions] = useState<AddResourceOptions[]>([]);
  const isCoreDm = useIsCoreDmOnly();

  useEffect(() => {
    if (scene.data === undefined || scene.data === null) {
      return;
    }
    const addResourceOptions: AddResourceOptions[] = [];
    scene.data.sceneModels.forEach((model) => {
      if (isClassicIdentifier(model.modelIdentifier)) {
        const addModelOptions: AddModelOptions<ClassicDataSourceType> = {
          modelId: model.modelIdentifier.modelId,
          revisionId: model.modelIdentifier.revisionId
        };

        addResourceOptions.push({
          ...addModelOptions,
          transform: model.transform,
          defaultVisible: model.defaultVisible
        });
      } else if (isDM3DModelIdentifier(model.modelIdentifier)) {
        const addModelOptions: AddModelOptions<DMDataSourceType> = {
          revisionExternalId: model.modelIdentifier.revisionExternalId,
          revisionSpace: model.modelIdentifier.revisionSpace
        };

        addResourceOptions.push({
          ...addModelOptions,
          transform: model.transform,
          defaultVisible: model.defaultVisible
        });
      }
    });

    scene.data.image360Collections.forEach((collection) => {
      const addModelOptions: AddImage360CollectionDatamodelsOptions = {
        source: isCoreDm ? 'cdm' : 'dm',
        externalId: collection.image360CollectionExternalId,
        space: collection.image360CollectionSpace,
        transform: collection.transform
      };

      addResourceOptions.push({
        ...addModelOptions,
        defaultVisible: collection.defaultVisible
      });
    });
    setResourceOptions(addResourceOptions);
  }, [scene.data]);

  return resourceOptions;
};
