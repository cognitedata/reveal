/*!
 * Copyright 2021 Cognite AS
 */

import { File3dFormat } from './types';

/**
 * Identifies a 3D model. Typically, implementations will use {@link CdfModelIdentifier}.
 */
export interface ModelIdentifier {
  // TODO 2021-10-03 larsmoa: Not sure if modelFormat belongs here
  readonly modelFormat: File3dFormat;
  readonly revealInternalId: symbol;
}
