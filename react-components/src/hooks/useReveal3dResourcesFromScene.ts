import { useSceneConfig } from './scenes/useSceneConfig';
import { type CogniteClient } from '@cognite/sdk';
import { type AddResourceOptions } from '../components/Reveal3DResources/types';
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
    if (scene === undefined) {
      return;
    }
    const addResourceOptions: AddResourceOptions[] = [];
    scene.sceneModels.forEach((model) => {
      if (isClassicIdentifier(model.modelIdentifier)) {
        addResourceOptions.push({
          modelId: model.modelIdentifier.modelId,
          revisionId: model.modelIdentifier.revisionId,
          transform: model.transform,
          defaultVisible: model.defaultVisible
        });
      } else if (isDM3DModelIdentifier(model.modelIdentifier)) {
        addResourceOptions.push({
          revisionExternalId: model.modelIdentifier.revisionExternalId,
          revisionSpace: model.modelIdentifier.revisionSpace,
          transform: model.transform,
          defaultVisible: model.defaultVisible
        });
      }
    });

    scene.image360Collections.forEach((collection) => {
      addResourceOptions.push({
        source: isCoreDm ? 'cdm' : 'dm',
        externalId: collection.image360CollectionExternalId,
        space: collection.image360CollectionSpace,
        transform: collection.transform,
        defaultVisible: collection.defaultVisible
      });
    });
    setResourceOptions(addResourceOptions);

    // Reason: isCoreDm intentionally omitted due to unnecessary calls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return resourceOptions;
};
