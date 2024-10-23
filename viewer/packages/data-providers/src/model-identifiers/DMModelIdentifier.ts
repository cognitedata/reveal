import { DMModelIdentifierType } from '../DataSourceType';
import { ModelIdentifier } from '../ModelIdentifier';

export class DMModelIdentifier implements ModelIdentifier {
  readonly revealInternalId: symbol;

  readonly revisionExternalId: string;
  readonly revisionSpace: string;

  constructor({ revisionExternalId, revisionSpace }: DMModelIdentifierType) {
    this.revealInternalId = Symbol(`${revisionSpace}/${revisionExternalId}`);
    this.revisionExternalId = revisionExternalId;
    this.revisionSpace = revisionSpace;
  }

  public toString(): string {
    return `${DMModelIdentifier.name} (${String(this.revealInternalId)})`;
  }
}
