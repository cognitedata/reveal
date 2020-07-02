/*!
 * Copyright 2020 Cognite AS
 */

import { CadTransformationProvider } from './CadTransformationProvider';
import { fromCdfToThreeJsCoordinates, fromThreeJsToCdfCoordinates } from '@/utilities/constructMatrixFromRotation';
import { ModelTransformation } from '@/utilities';

export class DefaultCadTransformation implements CadTransformationProvider {
  getCadTransformation(): ModelTransformation {
    return {
      modelMatrix: fromCdfToThreeJsCoordinates,
      inverseModelMatrix: fromThreeJsToCdfCoordinates
    };
  }
}
