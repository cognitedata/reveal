/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../utilities/TranslateKey';
import { DomainObject } from './DomainObject';

export class FolderDomainObject extends DomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Folder' };
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override clone(what?: symbol): DomainObject {
    const clone = new FolderDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }
}
