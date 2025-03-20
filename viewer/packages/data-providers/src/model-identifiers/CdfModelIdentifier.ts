/*!
 * Copyright 2021 Cognite AS
 */
import { ModelIdentifier } from '../ModelIdentifier';

/**
 * Identifies a 3D model stored in CDF by the combination of a modelId, a revisionId
 * and a format.
 */
export class CdfModelIdentifier implements ModelIdentifier {
  readonly revealInternalId: symbol;

  readonly modelId: number;
  readonly revisionId: number;

  constructor(modelId: number, revisionId: number) {
    this.revealInternalId = Symbol(`${modelId}/${revisionId}`);
    this.modelId = modelId;
    this.revisionId = revisionId;
  }

  public toString(): string {
    return `${CdfModelIdentifier.name} (${String(this.revealInternalId)})`;
  }

  /**
   * Returns a identifier in a serialized form, which uniquely identifies
   * the model in CDF
   */
  public sourceModelIdentifier(): string {
    return `cdf-classic: ${this.modelId}/${this.revisionId}`;
  }
}
