/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../components/RevealContainer/RevealContext';
import { useFdmNodeCache } from '../components/NodeCacheProvider/NodeCacheProvider';

export type CameraNavigationActions = {
  fitCameraToAllModels: () => void;
  fitCameraToModelNode: (revisionId: number, nodeId: number) => Promise<void>;
  fitCameraToInstance: (externalId: string, space: string) => Promise<void>;
};

export const useCameraNavigation = (): CameraNavigationActions => {
  const fdmNodeCache = useFdmNodeCache();
  const viewer = useReveal();

  const fitCameraToAllModels = (): void => {
    const models = viewer.models;
    if (models.length === 0) {
      return;
    }
    viewer.fitCameraToModels(models, undefined, true);
  };

  const fitCameraToModelNode = async (revisionId: number, nodeId: number): Promise<void> => {
    const model = viewer.models.find((m) => m.revisionId === revisionId);
    if (model === undefined) {
      await Promise.reject(new Error(`Could not find model with revision ${revisionId}`));
      return;
    }
    const nodeBoundingBox = await (model as CogniteCadModel).getBoundingBoxByNodeId(nodeId);
    viewer.cameraManager.fitCameraToBoundingBox(nodeBoundingBox);
  };

  const fitCameraToInstance = async (externalId: string, space: string): Promise<void> => {
    const modelsRevisionIds = viewer.models.map((model) => ({
      modelId: model.modelId,
      revisionId: model.revisionId
    }));

    const modelMappings = (
      await fdmNodeCache.cache.getMappingsForFdmIds([{ externalId, space }], modelsRevisionIds)
    )?.[0];

    const nodeId = modelMappings?.mappings.get(externalId);

    if (modelMappings === undefined || nodeId === undefined) {
      await Promise.reject(
        new Error(`Could not find a connected model to instance ${externalId} in space ${space}`)
      );
      return;
    }

    await fitCameraToModelNode(modelMappings.revisionId, nodeId.id);
  };

  return {
    fitCameraToAllModels,
    fitCameraToInstance,
    fitCameraToModelNode
  };
};
