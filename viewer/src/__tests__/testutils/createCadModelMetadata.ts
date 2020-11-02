/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata, CadModelMetadata } from '@/datamodels/cad';
import { SectorSceneImpl } from '@/datamodels/cad/sector/SectorScene';

let modelIdRunningNumber = 0;

export function createCadModelMetadata(root: SectorMetadata): CadModelMetadata {
  const scene = SectorSceneImpl.createFromRootSector(8, 1, 'Meters', root);
  const model: CadModelMetadata = {
    blobUrl: `testModel_${modelIdRunningNumber++}`,
    modelMatrix: new THREE.Matrix4().identity(),
    scene
  };
  return model;
}
