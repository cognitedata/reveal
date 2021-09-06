/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata } from '../metadata/types';
import { CadModelMetadata } from '../metadata/CadModelMetadata';
import { SectorSceneImpl } from '../utilities/SectorScene';

let modelIdRunningNumber = 0;

export function createCadModelMetadata(root: SectorMetadata): CadModelMetadata {
  const scene = SectorSceneImpl.createFromRootSector(8, 1, 'Meters', root);
  const modelId = `testModel_${modelIdRunningNumber++}`;
  const model: CadModelMetadata = {
    modelIdentifier: modelId,
    modelBaseUrl: `https://localhost/${modelId}`,
    modelMatrix: new THREE.Matrix4().identity(),
    inverseModelMatrix: new THREE.Matrix4().identity(),
    scene,
    geometryClipBox: null
  };
  return model;
}
