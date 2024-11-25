/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../utilities/IconName';
import { type TranslationInput } from '../utilities/TranslateInput';
import { DomainObject } from './DomainObject';

export class FolderDomainObject extends DomainObject {
  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: 'Folder' };
  }

  public override get icon(): IconName {
    return 'Folder';
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
