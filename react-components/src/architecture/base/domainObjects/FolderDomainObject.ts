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
    return { key: 'FOLDER', fallback: 'Folder' };
  }
}
