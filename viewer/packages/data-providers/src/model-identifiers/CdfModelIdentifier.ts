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
  readonly outputFormat: string | undefined;

  constructor(modelId: number, revisionId: number, outputFormat?: string) {
    const suffix = outputFormat ? `/${outputFormat}` : '';
    this.revealInternalId = Symbol(`${modelId}/${revisionId}${suffix}`);
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.outputFormat = outputFormat;
  }

  public toString(): string {
    return `${CdfModelIdentifier.name} (${String(this.revealInternalId)})`;
  }

  /**
   * Returns an identifier in a serialized form, which uniquely identifies
   * the model in CDF
   */
  public sourceModelIdentifier(): string {
    const suffix = this.outputFormat ? `/${this.outputFormat}` : '';
    return `cdf-classic: ${this.modelId}/${this.revisionId}${suffix}`;
  }
}
