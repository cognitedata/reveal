/*!
 * Copyright 2021 Cognite AS
 */
import { LocalModelIdentifier } from './LocalModelIdentifier';
import { File3dFormat } from './types';

/**
 * Identifies a 3D model stored in CDF by the combination of a modelId and a revisionId.
 */
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
