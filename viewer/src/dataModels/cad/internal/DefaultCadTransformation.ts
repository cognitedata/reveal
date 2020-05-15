/*!
 * Copyright 2020 Cognite AS
 */

import { CadTransformationProvider } from './CadTransformationProvider';
import { SectorModelTransformation } from './sector/types';
import { fromCdfToThreeJsCoordinates, fromThreeJsToCdfCoordinates } from '../../../utilities/fromThreeCameraConfig';

export class DefaultCadTransformation implements CadTransformationProvider {
  getCadTransformation(): SectorModelTransformation {
    return {
      modelMatrix: fromCdfToThreeJsCoordinates,
      inverseModelMatrix: fromThreeJsToCdfCoordinates
    };
  }
}
