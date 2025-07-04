import { type CameraState, type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import { Box3 } from 'three';
import { useFdmCadNodeCache } from '../components/CacheProvider/CacheProvider';

export type CameraNavigationActions = {
  fitCameraToVisualSceneBoundingBox: (duration?: number) => void;
  fitCameraToAllModels: (duration?: number) => void;
  fitCameraToModelNode: (revisionId: number, nodeId: number) => Promise<void>;
  fitCameraToModelNodes: (revisionId: number, nodeids: number[]) => Promise<void>;
  fitCameraToInstance: (externalId: string, space: string) => Promise<void>;
  fitCameraToInstances: (instances: Array<{ externalId: string; space: string }>) => Promise<void>;
  fitCameraToState: (cameraState: CameraState) => void;
};

export const useCameraNavigation = (): CameraNavigationActions => {
  const fdmNodeCache = useFdmCadNodeCache();
  const viewer = useReveal();

  const fitCameraToVisualSceneBoundingBox = (duration?: number): void => {
    viewer.fitCameraToVisualSceneBoundingBox(duration);
  };

  const fitCameraToAllModels = (duration?: number): void => {
    const models = viewer.models;
    if (models.length === 0) {
      return;
    }
    viewer.fitCameraToModels(models, duration, true);
  };

  const fitCameraToModelNodes = async (revisionId: number, nodeIds: number[]): Promise<void> => {
    const model = viewer.models.find((m) => m.revisionId === revisionId);
    if (model === undefined) {
      await Promise.reject(new Error(`Could not find model with revision ${revisionId}`));
      return;
    }

    const nodeBoundingBoxes = await (model as CogniteCadModel).getBoundingBoxesByNodeIds(nodeIds);
    const boundingBox = nodeBoundingBoxes.reduce(
      (currentBox, nextBox) => currentBox.union(nextBox),
      new Box3()
    );
    viewer.cameraManager.fitCameraToBoundingBox(boundingBox);
  };

  const fitCameraToModelNode = async (revisionId: number, nodeId: number): Promise<void> => {
    await fitCameraToModelNodes(revisionId, [nodeId]);
  };

  const fitCameraToInstances = async (
    instances: Array<{ externalId: string; space: string }>
  ): Promise<void> => {
    const modelsRevisionIds = viewer.models.map((model) => ({
      modelId: model.modelId,
      revisionId: model.revisionId
    }));

    const modelMappings = (
      await fdmNodeCache.getMappingsForFdmInstances(instances, modelsRevisionIds)
    ).find((model) => model.mappings.size > 0);

    const nodeIds = [...(modelMappings?.mappings.values() ?? [])].flat().map((node) => node.id);

    if (modelMappings === undefined || nodeIds.length === 0) {
      await Promise.reject(new Error(`Could not find a model connected to the instances`));
      return;
    }

    await fitCameraToModelNodes(modelMappings.revisionId, nodeIds);
  };

  const fitCameraToInstance = async (externalId: string, space: string): Promise<void> => {
    await fitCameraToInstances([{ externalId, space }]);
  };

  const fitCameraToState = (cameraState: CameraState): void => {
    viewer.cameraManager.setCameraState(cameraState);
  };

  return {
    fitCameraToVisualSceneBoundingBox,
    fitCameraToAllModels,
    fitCameraToInstance,
    fitCameraToInstances,
    fitCameraToModelNode,
    fitCameraToModelNodes,
    fitCameraToState
  };
};
