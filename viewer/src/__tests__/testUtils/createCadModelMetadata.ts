/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';

import { SectorMetadata, CadModelMetadata } from '@/datamodels/cad';
import { SectorSceneImpl } from '@/datamodels/cad/sector/SectorScene';

let modelIdRunningNumber = 0;

export function createCadModelMetadata(root: SectorMetadata): CadModelMetadata {
  const scene = SectorSceneImpl.createFromRootSector(8, 1, root);
  const model: CadModelMetadata = {
    blobUrl: `testModel_${modelIdRunningNumber++}`,
    modelTransformation: {
      inverseModelMatrix: mat4.identity(mat4.create()),
      modelMatrix: mat4.identity(mat4.create())
    },
    scene
  };
  return model;
}
