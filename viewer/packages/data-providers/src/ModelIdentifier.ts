/*!
 * Copyright 2021 Cognite AS
 */

import { CdfModelIdentifier } from './model-identifiers/CdfModelIdentifier';

/**
 * Identifies a 3D model. Typically, implementations will use {@link CdfModelIdentifier}.
 */
export type ModelIdentifier = {
  /**
   * Unique ID of the model.
   */
  readonly revealInternalId: symbol;
};
