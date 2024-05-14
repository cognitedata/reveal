/*!
 * Copyright 2024 Cognite AS
 */

import { DomainObject } from './DomainObject';

export class FolderDomainObject extends DomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public override get typeName(): string {
    return 'Folder';
  }
}
