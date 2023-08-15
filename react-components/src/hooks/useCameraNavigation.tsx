/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../components/RevealContainer/RevealContext';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { SYSTEM_3D_EDGE_SOURCE, type InModel3dEdgeProperties } from '../utilities/globalDataModels';

export type CameraNavigationActions = {
  fitCameraToAllModels: () => void;
  fitCameraToModelNode: (revisionId: number, nodeId: number) => Promise<void>;
  fitCameraToInstance: (externalId: string, space: string) => Promise<void>;
};

export const useCameraNavigation = (): CameraNavigationActions => {
  const viewer = useReveal();
  const fdmSDK = useFdmSdk();

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
    const fdmAssetMappingFilter = {
      equals: {
        property: ['edge', 'startNode'],
        value: { externalId, space }
      }
    };

    const assetEdges = await fdmSDK.filterInstances<InModel3dEdgeProperties>(
      fdmAssetMappingFilter,
      'edge',
      SYSTEM_3D_EDGE_SOURCE
    );

    if (assetEdges.edges.length === 0) {
      await Promise.reject(
        new Error(`Could not find a connected model to instance ${externalId} in space ${space}`)
      );
      return;
    }

    const { revisionId, revisionNodeId } = assetEdges.edges[0].properties;
    await fitCameraToModelNode(revisionId, revisionNodeId);
  };

  return {
    fitCameraToAllModels,
    fitCameraToInstance,
    fitCameraToModelNode
  };
};
