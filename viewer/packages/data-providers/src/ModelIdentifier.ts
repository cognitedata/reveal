/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever } from '@reveal/utilities';
import { InternalModelIdentifier, isClassicIdentifier, isDMIdentifier, isLocalIdentifier } from './DataSourceType';
import { CdfModelIdentifier } from './model-identifiers/CdfModelIdentifier';
import { DMModelIdentifier } from './model-identifiers/DMModelIdentifier';
import { LocalModelIdentifier } from './model-identifiers/LocalModelIdentifier';

/**
 * Identifies a 3D model. Typically, implementations will use {@link CdfModelIdentifier}.
 */
export interface ModelIdentifier {
  /**
   * Unique ID of the model.
   */
  readonly revealInternalId: symbol;
}

export function createModelIdentifier(identifier: InternalModelIdentifier): ModelIdentifier {
  if (isClassicIdentifier(identifier)) {
    return new CdfModelIdentifier(identifier.modelId, identifier.revisionId);
  } else if (isDMIdentifier(identifier)) {
    return new DMModelIdentifier(identifier);
  } else if (isLocalIdentifier(identifier)) {
    return new LocalModelIdentifier(identifier.localPath);
  } else {
    assertNever(identifier);
  }
}
