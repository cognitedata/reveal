/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';

import { ModelTransformation } from '@/utilities';
import { ModelTransformationProvider } from '@/utilities/networking/types';

const identity = mat4.identity(mat4.create());

export class DefaultPointCloudTransformation implements ModelTransformationProvider {
  getModelTransformation(): ModelTransformation {
    return {
      modelMatrix: identity,
      inverseModelMatrix: identity
    };
  }
}
