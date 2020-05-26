/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation } from './sector/types';

export interface CadTransformationProvider {
  getCadTransformation(): SectorModelTransformation;
}
