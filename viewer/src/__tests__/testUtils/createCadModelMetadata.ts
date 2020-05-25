/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';
import { CadModelMetadata } from '@/dataModels/cad/internal';
import { SectorMetadata } from '@/dataModels/cad/internal/sector/types';
import { SectorSceneImpl } from '@/dataModels/cad/internal/sector/SectorScene';

export function createCadModelMetadata(root: SectorMetadata): CadModelMetadata {
  const scene = SectorSceneImpl.createFromRootSector(8, 1, root);
  const model: CadModelMetadata = {
    blobUrl: 'test',
    modelTransformation: {
      inverseModelMatrix: mat4.identity(mat4.create()),
      modelMatrix: mat4.identity(mat4.create())
    },
    scene
  };
  return model;
}
