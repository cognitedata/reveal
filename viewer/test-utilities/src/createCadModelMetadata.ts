/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { File3dFormat, LocalModelIdentifier } from '../../packages/data-providers';
import { SectorMetadata, CadModelMetadata, SectorSceneFactory } from '../../packages/cad-parsers';

let modelIdRunningNumber = 0;

export function createCadModelMetadata(sceneVersion: number, root: SectorMetadata): CadModelMetadata {
  const factory = new SectorSceneFactory();
  const scene = factory.createSectorScene(sceneVersion, 1, 'Meters', root);
  const modelId = `testModel_${modelIdRunningNumber++}`;
  const model: CadModelMetadata = {
    modelIdentifier: new LocalModelIdentifier(modelId),
    format: File3dFormat.GltfCadModel,
    formatVersion: sceneVersion,
    modelBaseUrl: `https://localhost/${modelId}`,
    modelMatrix: new THREE.Matrix4().identity(),
    inverseModelMatrix: new THREE.Matrix4().identity(),
    scene,
    geometryClipBox: null
  };
  return model;
}
