/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { File3dFormat } from '../../packages/modeldata-api';
import { SectorMetadata, CadModelMetadata, SectorSceneFactory } from '../../packages/cad-parsers';

let modelIdRunningNumber = 0;

export function createCadModelMetadata(root: SectorMetadata): CadModelMetadata {
  const factory = new SectorSceneFactory();
  const scene = factory.createSectorScene(8, 1, 'Meters', root);
  const modelId = `testModel_${modelIdRunningNumber++}`;
  const model: CadModelMetadata = {
    modelIdentifier: modelId,
    format: File3dFormat.RevealCadModel,
    modelBaseUrl: `https://localhost/${modelId}`,
    modelMatrix: new THREE.Matrix4().identity(),
    inverseModelMatrix: new THREE.Matrix4().identity(),
    scene,
    geometryClipBox: null
  };
  return model;
}
