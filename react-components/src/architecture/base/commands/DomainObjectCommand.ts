/*!
 * Copyright 2024 Cognite AS
 */

import { BaseCommand } from './BaseCommand';

export abstract class DomainObjectCommand<Type> extends BaseCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  protected readonly _domainObject: Type;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(domainObject: Type) {
    super();
    this._domainObject = domainObject;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get hasData(): boolean {
    return true;
  }
}
