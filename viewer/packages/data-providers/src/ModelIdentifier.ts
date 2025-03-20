/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever } from '@reveal/utilities';
import {
  ClassicModelIdentifierType,
  DMModelIdentifierType,
  isClassicIdentifier,
  isDMIdentifier,
  isLocalIdentifier,
  LocalModelIdentifierType
} from './DataSourceType';
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

  /**
   * Returns a identifier in a serialized form, which uniquely identifies
   * the model from the data source
   */
  sourceModelIdentifier(): string;
}

export function createModelIdentifier(
  identifier:
    | ClassicModelIdentifierType
    | (DMModelIdentifierType & ClassicModelIdentifierType)
    | LocalModelIdentifierType
): ModelIdentifier {
  if (isLocalIdentifier(identifier)) {
    return new LocalModelIdentifier(identifier.localPath);
  } else if (isDMIdentifier(identifier)) {
    return new DMModelIdentifier(identifier);
  } else if (isClassicIdentifier(identifier)) {
    return new CdfModelIdentifier(identifier.modelId, identifier.revisionId);
  } else {
    assertNever(identifier);
  }
}
