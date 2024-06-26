/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { type DomainObject } from '../domainObjects/DomainObject';
import { DomainObjectCommand } from '../commands/DomainObjectCommand';
import { Changes } from '../domainObjectsHelpers/Changes';

export class DeleteDomainObjectCommand extends DomainObjectCommand<DomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'DELETE', fallback: 'Delete' };
  }

  public override get icon(): string {
    return 'Delete';
  }

  public override get buttonType(): string {
    return 'ghost-destructive';
  }

  public override get isEnabled(): boolean {
    return this._domainObject.canBeRemoved;
  }

  protected override invokeCore(): boolean {
    this.addTransaction(this._domainObject.createTransaction(Changes.deleted));
    return this._domainObject.removeInteractive();
  }
}
