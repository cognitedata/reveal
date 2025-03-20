/*!
 * Copyright 2024 Cognite AS
 */
import { ClassicModelIdentifierType, DMModelIdentifierType } from '../DataSourceType';
import { CdfModelIdentifier } from './CdfModelIdentifier';

export class DMModelIdentifier extends CdfModelIdentifier {
  readonly revealInternalId: symbol;

  readonly revisionExternalId: string;
  readonly revisionSpace: string;

  constructor({
    modelId,
    revisionId,
    revisionExternalId,
    revisionSpace
  }: DMModelIdentifierType & ClassicModelIdentifierType) {
    super(modelId, revisionId);
    this.revealInternalId = Symbol(`${revisionSpace}/${revisionExternalId}`);
    this.revisionExternalId = revisionExternalId;
    this.revisionSpace = revisionSpace;
  }

  public toString(): string {
    return `${DMModelIdentifier.name} (${String(this.revealInternalId)})`;
  }

  public sourceModelIdentifier(): string {
    return `DMS: ${this.revisionSpace}/${this.revisionExternalId}`;
  }
}
