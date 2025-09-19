/*!
 * Copyright 2021 Cognite AS
 */

import { ModelIdentifier } from '../ModelIdentifier';

/**
 * Identifies a 3D model by a URL. This implementation is used for testing
 * purposes.
 */
export class LocalModelIdentifier implements ModelIdentifier {
  readonly revealInternalId: symbol;
  readonly localPath: string;

  constructor(localPath: string) {
    this.revealInternalId = Symbol(localPath);
    this.localPath = localPath;
  }

  public toString(): string {
    return `${LocalModelIdentifier.name} (${this.localPath})`;
  }

  public sourceModelIdentifier(): string {
    return `local: ${this.localPath}`;
  }
}
