/*!
 * Copyright 2020 Cognite AS
 */

import { fromCdfToThreeJsCoordinates, fromThreeJsToCdfCoordinates } from '@/utilities/constructMatrixFromRotation';
import { ModelTransformation } from '@/utilities';
import { ModelTransformationProvider } from '@/utilities/networking/types';

export class DefaultCadTransformation implements ModelTransformationProvider {
  getModelTransformation(): ModelTransformation {
    return {
      modelMatrix: fromCdfToThreeJsCoordinates,
      inverseModelMatrix: fromThreeJsToCdfCoordinates
    };
  }
}
