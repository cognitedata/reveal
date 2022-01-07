/*!
 * Copyright 2022 Cognite AS
 */
import { ModelIdentifier } from '..';
import { File3dFormat } from './types';

/**
 * Identifies a 3D model stored in CDF by the combination of a modelId, a revisionId
 * and a format.
 */
export class CdfModelIdentifier implements ModelIdentifier {
  readonly revealInternalId: symbol;
  readonly modelFormat: File3dFormat;

  readonly modelId: number;
  readonly revisionId: number;

  constructor(modelId: number, revisionId: number, modelFormat: File3dFormat) {
    this.revealInternalId = Symbol(`${modelId}/${revisionId}[${modelFormat}]`);
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.modelFormat = modelFormat;
  }

  public toString(): string {
    return `${CdfModelIdentifier.name} (${String(this.revealInternalId)} - ${this.modelFormat})`;
  }
}
