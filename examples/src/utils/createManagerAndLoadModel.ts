import { THREE } from '@cognite/reveal';
import {
  PointCloudNode,
  CadNode,
  RevealManager,
  CdfModelIdentifier,
  LocalModelIdentifier,
  createCdfRevealManager,
  createLocalRevealManager,
  SceneHandler
} from "@cognite/reveal/internals";

import { CogniteClient } from "@cognite/sdk";

export async function createManagerAndLoadModel(
  sdkClient: CogniteClient,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  modelType: 'cad',
  modelRevision: { modelId: number, revisionId: number } | undefined,
  modelUrl: { fileName: string | undefined } | undefined
): Promise<{ revealManager: RevealManager, model: CadNode }>;
export async function createManagerAndLoadModel(
  sdkClient: CogniteClient,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  modelType: 'pointcloud',
  modelRevision: { modelId: number, revisionId: number } | undefined,
  modelUrl: { fileName: string | undefined } | undefined
): Promise<{ revealManager: RevealManager, model: PointCloudNode }>;

export async function createManagerAndLoadModel(
  sdkClient: CogniteClient,
  renderer: THREE.WebGLRenderer,
  sceneHandler: SceneHandler,
  modelType: 'cad' | 'pointcloud',
  modelRevision: { modelId: number, revisionId: number } | undefined,
  modelUrl: { fileName: string | undefined } | undefined
): Promise<{ revealManager: RevealManager, model: CadNode | PointCloudNode }> {
  if (modelRevision) {
    const revealManager = createCdfRevealManager(sdkClient, renderer, sceneHandler, { logMetrics: false });
    switch (modelType) {
      case 'cad': {
          const modelIdentifier = new CdfModelIdentifier(modelRevision.modelId, modelRevision.revisionId);
          const model = await revealManager.addModel('cad', modelIdentifier);
          return { revealManager, model };
      }
      case 'pointcloud': {
          const modelIdentifier = new CdfModelIdentifier(modelRevision.modelId, modelRevision.revisionId);
          const model = await revealManager.addModel('pointcloud', modelIdentifier);
          return { revealManager, model };
      }
      default:
        throw new Error(`Unsupported model type '${modelType}'`);
    }
  } else if (modelUrl) {
    const revealManager = createLocalRevealManager(renderer, sceneHandler, { logMetrics: false });
    switch (modelType) {
      case 'cad': {
          const modelIdentifier = new LocalModelIdentifier(modelUrl.fileName!);
          const model = await revealManager.addModel('cad', modelIdentifier);
          return { revealManager, model };
      }
      case 'pointcloud': {
          const modelIdentifier = new LocalModelIdentifier(modelUrl.fileName!);
          const model = await revealManager.addModel('pointcloud', modelIdentifier);
          return { revealManager, model };
      }
      default:
        throw new Error(`Unsupported model type '${modelType}'`);
    }
  } else {
    throw new Error(
      'Need to provide either project & model OR modelUrl as query parameters'
    );
  }
}