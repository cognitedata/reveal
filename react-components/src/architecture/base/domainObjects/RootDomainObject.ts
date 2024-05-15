/*!
 * Copyright 2024 Cognite AS
 */

import { DomainObject } from './DomainObject';

export class RootDomainObject extends DomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.name = 'Root';
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): string {
    return 'Root';
  }
}
