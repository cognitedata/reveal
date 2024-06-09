/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from '../commands/BaseCommand';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type DomainObject } from '../domainObjects/DomainObject';

export class DeleteDomainObjectCommand extends BaseCommand {
  private readonly _domainObject: DomainObject | undefined = undefined;
  public constructor(domainObject: DomainObject) {
    super();
    this._domainObject = domainObject;
  }
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
    return this._domainObject !== undefined && this._domainObject.canBeRemoved;
  }

  public override get hasData(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    if (this._domainObject === undefined) {
      return false;
    }
    return this._domainObject.removeInteractive();
  }
}
