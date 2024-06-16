/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../domainObjects/DomainObject';
import { BaseCommand } from './BaseCommand';

export abstract class DomainObjectCommand<Type extends DomainObject> extends BaseCommand {
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
