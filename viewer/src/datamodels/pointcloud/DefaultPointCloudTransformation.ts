/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';

import { TransformationProvider } from '@/datamodels/base';
import { ModelTransformation } from '@/utilities';

const identity = mat4.identity(mat4.create());

export class DefaultPointCloudTransformation implements TransformationProvider {
  getModelTransformation(): ModelTransformation {
    return {
      modelMatrix: identity,
      inverseModelMatrix: identity
    };
  }
}
