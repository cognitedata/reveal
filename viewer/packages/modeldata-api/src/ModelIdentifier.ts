/*!
 * Copyright 2021 Cognite AS
 */

import { File3dFormat } from './types';

export interface ModelIdentifier {
  // TODO 2021-10-03 larsmoa: Not sure if modelFormat belongs here
  readonly modelFormat: File3dFormat;
  readonly revealInternalId: symbol;

  toString(): string;
}

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

export class CdfModelIdentifier {
  readonly revealInternalId: symbol;
  readonly modelFormat: File3dFormat;

  readonly modelId: number;
  readonly revisionId: number;

  constructor(modelId: number, revisionId: number, modelFormat: File3dFormat) {
    this.revealInternalId = Symbol(`${modelId}/${revisionId}`);
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.modelFormat = modelFormat;
  }

  public toString(): string {
    return `${LocalModelIdentifier.name} (${String(this.revealInternalId)} - ${this.modelFormat})`;
  }
}
