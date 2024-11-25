/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { FolderDomainObject } from '../../base/domainObjects/FolderDomainObject';

export class Image360AnnotationFolder extends FolderDomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: '360 image annotations' };
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new Image360AnnotationFolder();
    clone.copyFrom(this, what);
    return clone;
  }
}
