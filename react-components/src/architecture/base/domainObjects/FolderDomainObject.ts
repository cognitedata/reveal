/*!
 * Copyright 2024 Cognite AS
 */

import { DomainObject } from './DomainObject';

export class FolderDomainObject extends DomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): string {
    return 'Folder';
  }
}
