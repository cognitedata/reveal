/*!
 * Copyright 2020 Cognite AS
 */

import { CadTransformationProvider } from '@/datamodels/cad/CadTransformationProvider';
import { SectorModelTransformation } from '@/datamodels/cad/sector/types';
import { mat4 } from 'gl-matrix';

const identity = mat4.identity(mat4.create());

export class DefaultPointCloudTransformation implements CadTransformationProvider {
  getCadTransformation(): SectorModelTransformation {
    return {
      modelMatrix: identity,
      inverseModelMatrix: identity
    };
  }
}
