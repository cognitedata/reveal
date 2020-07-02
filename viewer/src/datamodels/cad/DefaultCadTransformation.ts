/*!
 * Copyright 2020 Cognite AS
 */

import { fromCdfToThreeJsCoordinates, fromThreeJsToCdfCoordinates } from '@/utilities/constructMatrixFromRotation';
import { TransformationProvider } from '@/datamodels/base';
import { ModelTransformation } from '@/utilities';

export class DefaultCadTransformation implements TransformationProvider {
  getModelTransformation(): ModelTransformation {
    return {
      modelMatrix: fromCdfToThreeJsCoordinates,
      inverseModelMatrix: fromThreeJsToCdfCoordinates
    };
  }
}
