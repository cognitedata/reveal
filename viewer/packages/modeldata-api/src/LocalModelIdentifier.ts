/*!
 * Copyright 2021 Cognite AS
 */
import { File3dFormat } from './types';

/**
 * Identifies a 3D model by a URL. This implementation is used for testing
 * purposes.
 */
export class LocalModelIdentifier {
  readonly revealInternalId: symbol;
  readonly modelFormat: File3dFormat;

  readonly localPath: string;

  constructor(localPath: string, modelFormat: File3dFormat) {
    this.revealInternalId = Symbol(localPath);
    this.modelFormat = modelFormat;
    this.localPath = localPath;
  }

  public toString(): string {
    return `${LocalModelIdentifier.name} (${this.localPath} - ${this.modelFormat})`;
  }
}
